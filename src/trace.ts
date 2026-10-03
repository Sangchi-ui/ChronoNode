export type Focus = { indices?: number[]; values?: unknown[]; names?: string[]; result?: string; range?: number[]; direction?: string; cells?: number[][]; readCells?: number[][]; writeCells?: number[][] };
export type LineComplexity = { time: string; timeDetails: string; space: string; spaceDetails: string };
export type TraceEvent = {
  step: number; line: number; statement: string; eventType: string; operation: string;
  function: string; depth: number; variables: Record<string, unknown>;
  globals: Record<string, unknown>; arguments: Record<string, unknown>; returnValue?: unknown;
  beforeState: Record<string, unknown>; afterState: Record<string, unknown>;
  state: Record<string, unknown>; focus: Focus; explanation: string;
  message?: string;
  lineComplexity: LineComplexity;
  callStack: Array<{ name: string; line: number; arguments: Record<string, unknown> }>;
  output?: string;
  structure: string;
  dataStructure: string;
  visualizerType?: string;
};

export type Pyodide = { runPythonAsync(source: string): Promise<unknown> };
let runtimePromise: Promise<Pyodide> | undefined;

export function loadPython(): Promise<Pyodide> {
  if (runtimePromise) return runtimePromise;
  const loading = new Promise<Pyodide>((resolve, reject) => {
    const boot = () => {
      const loadPyodide = (globalThis as any).loadPyodide;
      if (typeof loadPyodide !== 'function') {
        reject(new Error('Pyodide loaded without its runtime factory. Refresh the page and try again.'));
        return;
      }
      Promise.resolve(loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/' })).then(resolve, reject);
    };
    if (typeof (globalThis as any).loadPyodide === 'function') {
      boot();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js';
    script.onload = boot;
    script.onerror = () => reject(new Error('Could not load Python. Check the connection to cdn.jsdelivr.net.'));
    document.head.appendChild(script);
  });
  runtimePromise = loading.catch(error => {
    runtimePromise = undefined;
    throw error;
  });
  return runtimePromise;
}

const STRUCTURE_ALIASES: Record<string, string> = {
    'bit-array': 'bitwise', bitboard: 'bitwise', 'binary-tree': 'tree', bst: 'tree', 'binary-search-tree': 'tree', avl: 'tree', 'red-black': 'tree',
    'segment-tree': 'range-query', fenwick: 'range-query', 'fenwick-tree': 'range-query', 'sparse-table': 'range-query',
    'priority-queue': 'heap', 'min-heap': 'heap', 'max-heap': 'heap', 'singly-linked-list': 'linked-list', 'doubly-linked-list': 'linked-list',
    'circular-linked-list': 'linked-list', hashing: 'hash-table', 'pattern-matching': 'string', 'advanced-strings': 'string',
    'shortest-path': 'graph', 'minimum-spanning-tree': 'graph', mst: 'graph', 'flow-network': 'graph', backtracking: 'recursion',
};

export function normalizeStructure(kind: string): string {
    const normalized = kind.toLowerCase().replaceAll('_', '-');
    return STRUCTURE_ALIASES[normalized] || normalized;
}

export function detectStructure(event: Pick<TraceEvent, 'statement' | 'state' | 'callStack'>, source: string): string {
  const text = `${source}\n${event.statement}`.toLowerCase();
    const objects = Object.values(event.state).filter((value): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value));
    const hasTypedObject = objects.some(value => '__type__' in value);
  const annotation = source.match(/@visualize\s+([\w-]+)\s+(\w+)/i);
    if (annotation && Object.prototype.hasOwnProperty.call(event.state, annotation[2])) return normalizeStructure(annotation[1]);
    if (Object.entries(event.state).some(([name, value]) => /^(graph|network|adjacency|adj)$/.test(name.toLowerCase()) && !!value && typeof value === 'object')) return 'graph';
    if (objects.some(value => '__type__' in value && 'children' in value) || (hasTypedObject && /\.\s*children\s*=/.test(source))) return 'trie';
    if (objects.some(value => '__type__' in value && ('left' in value || 'right' in value)) || (hasTypedObject && /\.\s*(?:left|right)\s*=/.test(source))) return 'tree';
    if (objects.some(value => '__type__' in value && ('next' in value || 'prev' in value)) || (hasTypedObject && /\.\s*(?:next|prev)\s*=/.test(source))) return 'linked-list';
    if (Object.keys(event.state).some(name => name.toLowerCase().includes('parent')) && /\b(find|union)\s*\(/.test(text)) return 'union-find';
    if ((text.includes('dp') || text.includes('memo')) && Object.values(event.state).some(value => Array.isArray(value) && value.some(Array.isArray))) return 'dynamic-programming';
    if (/\b(segment_tree|fenwick|bit_tree|sparse_table|rmq|rsq)\b/.test(text)) return 'range-query';
    if (text.includes('heap') && Object.values(event.state).some(Array.isArray)) return 'heap';
  const frameNames = event.callStack.map(frame => frame.name);
    const recursiveDefinition = Array.from(source.matchAll(/(?:^|\n)\s*def\s+([A-Za-z_]\w*)\s*\([^)]*\)\s*:/g), match => {
        const bodyStart = (match.index ?? 0) + match[0].length;
        const lines = source.slice(bodyStart).split('\n');
        const end = lines.findIndex(line => line.length > 0 && !/^\s/.test(line));
        return lines.slice(0, end < 0 ? undefined : end).some(line => new RegExp(`\\b${match[1]}\\s*\\(`).test(line));
    }).some(Boolean);
    if (recursiveDefinition || frameNames.some(name => frameNames.filter(candidate => candidate === name).length > 1)) return 'recursion';
    if (/\b(segment_tree|fenwick|bit_tree|sparse_table|rmq|rsq)\b/.test(text)) return 'range-query';
    if (/\b(points?|orientation|cross_product|convex_hull|polygon)\b/.test(text)) return 'geometry';
    if (/\b(gcd|lcm|prime|modular|mod_inverse|sieve|factorial)\b/.test(text)) return 'mathematical';
    if (/&=|\|=|\^=|<<|>>|(?<![<])&|(?<![|])\|/.test(text)) return 'bitwise';
    if (/\bdeque\b/.test(text)) return /\b(?:queue|q)\s*=\s*(?:collections\.)?deque\s*\(/.test(text) ? 'queue' : 'deque';
    if (/\b(queue|q|frontier)\.(append|popleft|put|get)\b/.test(text) || /\b[A-Za-z_]\w*\.pop\s*\(\s*0\s*\)/.test(text)) return 'queue';
    const pushes = new Set(Array.from(source.matchAll(/\b([A-Za-z_]\w*)\s*\.\s*(?:append|push)\s*\(/g), match => match[1]));
    const pops = new Set(Array.from(source.matchAll(/\b([A-Za-z_]\w*)\s*\.\s*pop\s*\(/g), match => match[1]));
    if ([...pushes].some(name => pops.has(name) && Array.isArray(event.state[name]))) return 'stack';
    if ((text.includes('hash') || text.includes('table') || text.includes('frequency')) && Object.values(event.state).some(value => !!value && typeof value === 'object')) return 'hash-table';
    if (Object.entries(event.state).some(([name, value]) => name.toLowerCase().includes('string') || name.toLowerCase().includes('text') || name.toLowerCase().includes('word') || (typeof value === 'string' && value.length > 1 && !value.startsWith('<')))) return 'string';
    if (Object.values(event.state).some(Array.isArray)) return 'array';
    if (Object.values(event.state).some(v => !!v && typeof v === 'object')) return 'mapping';
  return 'generic';
}

function preparePython(code: string): string {
  return code.split('\n').map(line => /^\s*@visualize\s+[\w-]+\s+\w+\s*$/.test(line) ? `${line.match(/^\s*/)?.[0] || ''}# ${line.trim()}` : line).join('\n');
}

const PYTHON_TRACE = String.raw`import sys, json, linecache, dis, copy, re, types, ast, io, contextlib, weakref, time
USER_CODE = __USER_CODE__
SOURCE = USER_CODE.splitlines()
EXECUTION_TIMEOUT_MS = __EXECUTION_TIMEOUT_MS__
execution_deadline = time.monotonic() + EXECUTION_TIMEOUT_MS / 1000
events = []
frames = []
last_by_frame = {}
last_context = {}
instruction_maps = {}
pending_conditions = {}
reported_exceptions=set()
op_count = 0
event_limit = __EVENT_LIMIT__
ignored_lines=set()
ignored_scopes=set()
entry_functions=set()
stack_variables=set()
comprehension_lines=set()
comprehension_locals=set()
defer_module_events=False
recording=True
operation_names = {'read','write','compare','assign','swap','move','insert','delete','push','pop','enqueue','dequeue','enqueue-left','enqueue-right','dequeue-left','dequeue-right','visit','discover','relax','rotate','partition','merge','split','call','return','branch','lookup','update','backtrack','table-read','table-write','error','complete','line'}
object_ids={}
next_object_id=1
def object_token(value):
    global next_object_id
    ident=id(value)
    existing=object_ids.get(ident)
    if existing and existing[0]() is value: return existing[1]
    label='node-'+str(next_object_id); next_object_id+=1
    def cleanup(reference,key=ident):
        current=object_ids.get(key)
        if current and current[0] is reference: object_ids.pop(key,None)
    try: reference=weakref.ref(value,cleanup)
    except TypeError: reference=lambda: value
    object_ids[ident]=(reference,label)
    return label
deque_variables=set()
deque_constructors={'deque'}
collections_modules={'collections'}
visualize_kinds={}
for annotation in re.finditer(r'@visualize\s+([\w-]+)\s+(\w+)',USER_CODE):
    visualize_kinds[annotation.group(2)]=annotation.group(1).lower().replace('_','-')
try:
    source_tree=ast.parse(USER_CODE)
    for node in ast.walk(source_tree):
        if isinstance(node,(ast.Import,ast.ImportFrom)):
            ignored_lines.update(range(node.lineno,node.end_lineno+1))
        elif isinstance(node,(ast.FunctionDef,ast.AsyncFunctionDef,ast.ClassDef)):
            starts=[node.lineno]+[decorator.lineno for decorator in node.decorator_list]
            first_body_line=min((child.lineno for child in node.body),default=node.end_lineno+1)
            ignored_lines.update(range(min(starts),first_body_line))
            if isinstance(node,ast.ClassDef): ignored_scopes.add(node.name)
        elif isinstance(node,ast.If):
            test_src=''
            try: test_src=ast.unparse(node.test)
            except Exception: pass
            if '__name__' in test_src:
                ignored_lines.add(node.lineno)
        elif isinstance(node,(ast.ListComp,ast.SetComp,ast.DictComp,ast.GeneratorExp)):
            comprehension_lines.add(node.lineno)
            for generator in node.generators:
                comprehension_locals.update(child.id for child in ast.walk(generator.target) if isinstance(child,ast.Name))
    stack_pushes=set()
    stack_pops=set()
    for node in ast.walk(source_tree):
        if isinstance(node,ast.Call) and isinstance(node.func,ast.Attribute) and isinstance(node.func.value,ast.Name):
            if node.func.attr in ('append','push'): stack_pushes.add(node.func.value.id)
            elif node.func.attr=='pop': stack_pops.add(node.func.value.id)
    stack_variables=stack_pushes & stack_pops
    entry_functions={node.name for node in source_tree.body if isinstance(node,(ast.FunctionDef,ast.AsyncFunctionDef))}
    module_calls=set()
    def collect_module_calls(node):
        if isinstance(node,(ast.FunctionDef,ast.AsyncFunctionDef,ast.ClassDef,ast.Lambda)): return
        if isinstance(node,ast.Call) and isinstance(node.func,ast.Name): module_calls.add(node.func.id)
        for child in ast.iter_child_nodes(node): collect_module_calls(child)
    for node in source_tree.body: collect_module_calls(node)
    defer_module_events=bool(entry_functions & module_calls)
    recording=not defer_module_events
    for node in ast.walk(source_tree):
        if isinstance(node,ast.ImportFrom) and node.module=='collections':
            for alias in node.names:
                if alias.name=='deque': deque_constructors.add(alias.asname or alias.name)
        elif isinstance(node,ast.Import):
            for alias in node.names:
                if alias.name=='collections': collections_modules.add(alias.asname or alias.name)
    def is_deque_constructor(value):
        if not isinstance(value,ast.Call): return False
        fn=value.func
        return (isinstance(fn,ast.Name) and fn.id in deque_constructors) or (isinstance(fn,ast.Attribute) and fn.attr=='deque' and isinstance(fn.value,ast.Name) and fn.value.id in collections_modules)
    def collect_target_names(target):
        if isinstance(target,ast.Name): deque_variables.add(target.id)
        elif isinstance(target,(ast.Tuple,ast.List)):
            for child in target.elts: collect_target_names(child)
    for node in ast.walk(source_tree):
        if isinstance(node,ast.Assign) and is_deque_constructor(node.value):
            for target in node.targets: collect_target_names(target)
        elif isinstance(node,ast.AnnAssign) and is_deque_constructor(node.value): collect_target_names(node.target)
except Exception: pass
for name,kind in visualize_kinds.items():
    if kind=='deque': deque_variables.add(name)
    elif kind=='queue': deque_variables.discard(name)
    elif kind=='stack': stack_variables.add(name)
deque_variables.discard('queue'); deque_variables.discard('q')
def canonical_structure(kind):
    aliases={'bitboard':'bitwise','bit-array':'bitwise','binary-tree':'tree','binary-search-tree':'tree','bst':'tree','avl':'tree','red-black':'tree','priority-queue':'heap','min-heap':'heap','max-heap':'heap','singly-linked-list':'linked-list','doubly-linked-list':'linked-list','circular-linked-list':'linked-list','hashing':'hash-table','pattern-matching':'string','advanced-strings':'string','shortest-path':'graph','minimum-spanning-tree':'graph','mst':'graph','flow-network':'graph','backtracking':'recursion','segment-tree':'range-query','fenwick':'range-query','fenwick-tree':'range-query','sparse-table':'range-query','variables':'generic','generic':'generic'}
    return aliases.get(kind,kind)
def infer_primary_structure():
    if visualize_kinds: return canonical_structure(next(iter(visualize_kinds.values())))
    try: tree=source_tree
    except BaseException: return 'generic'
    lower=USER_CODE.lower()
    class_fields=set()
    assigned_names=set()
    has_list=False
    has_matrix=False
    recursive=False
    try:
        for node in ast.walk(tree):
            if isinstance(node,(ast.Assign,ast.AnnAssign)):
                targets=node.targets if isinstance(node,ast.Assign) else [node.target]
                value=node.value
                if isinstance(value,(ast.List,ast.ListComp,ast.SetComp,ast.DictComp,ast.GeneratorExp)): has_list=True
                if isinstance(value,ast.List) and any(isinstance(child,(ast.List,ast.ListComp)) for child in value.elts): has_matrix=True
                def names(target):
                    if isinstance(target,ast.Name): assigned_names.add(target.id.lower())
                    elif isinstance(target,(ast.Tuple,ast.List)):
                        for child in target.elts: names(child)
                for target in targets: names(target)
            elif isinstance(node,ast.ClassDef):
                for child in ast.walk(node):
                    targets=child.targets if isinstance(child,ast.Assign) else [child.target] if isinstance(child,ast.AnnAssign) else []
                    for target in targets:
                        if isinstance(target,ast.Attribute): class_fields.add(target.attr.lower())
            elif isinstance(node,(ast.FunctionDef,ast.AsyncFunctionDef)):
                for child in ast.walk(node):
                    if isinstance(child,ast.Call) and isinstance(child.func,ast.Name) and child.func.id==node.name: recursive=True
    except BaseException: pass
    if re.search(r'\b(graph|network|adjacency|adj)\s*=',lower) or ('edges' in assigned_names and re.search(r'\b(union|find|kruskal|prim)\b',lower)): return 'graph'
    if re.search(r'\b(segment_tree|fenwick|bit_tree|sparse_table|rmq|rsq)\b',lower): return 'range-query'
    if 'children' in class_fields: return 'trie'
    if 'next' in class_fields or 'prev' in class_fields: return 'linked-list'
    if 'left' in class_fields or 'right' in class_fields: return 'tree'
    if 'parent' in assigned_names and re.search(r'\b(find|union|parent)\b',lower): return 'union-find'
    if {'dp','memo'} & assigned_names or (has_matrix and 'cost' in assigned_names): return 'dynamic-programming'
    if re.search(r'\b(segment_tree|fenwick|bit_tree|sparse_table|rmq|rsq)\b',lower): return 'range-query'
    if 'queries' in assigned_names and re.search(r'\b(block|mo|offline|segment|fenwick)\b',lower): return 'range-query'
    if 'heap' in lower or 'heapq' in lower: return 'heap'
    if recursive: return 'recursion'
    if re.search(r'&=|\|=|\^=|<<|>>|(?<![<])&|(?<![|])\|',lower): return 'bitwise'
    if re.search(r'\b(points?|orientation|cross_product|convex_hull|polygon)\b',lower): return 'geometry'
    if re.search(r'\b(gcd|lcm|prime|modular|mod_inverse|sieve|factorial)\b',lower): return 'mathematical'
    if re.search(r'\b(random|reservoir|monte_carlo|las_vegas)\b',lower): return 'array'
    if 'deque' in lower: return 'queue' if re.search(r'\b(queue|q)\s*=.*deque',lower) else 'deque'
    if {'queue','q','frontier'} & assigned_names and re.search(r'\b(popleft|put|get)\b',lower): return 'queue'
    if re.search(r'\b[A-Za-z_]\w*\.pop\s*\(\s*0\s*\)',lower): return 'queue'
    if stack_variables: return 'stack'
    if re.search(r'\b(hash|hash_map|hash_table|frequency|frequencies|counts|freq|seen)\b',lower) and (has_list or 'set(' in lower or '{}' in USER_CODE): return 'hash-table'
    if {'text','string','pattern','word','words'} & assigned_names or re.search(r'\b(kmp|rabin_karp|manacher|prefix_function)\b',lower): return 'string'
    if has_list or re.search(r'\b(array|values|arr)\b',lower): return 'array'
    if has_matrix: return 'dynamic-programming'
    if any(isinstance(node,ast.Dict) for node in ast.walk(tree)): return 'mapping'
    return 'generic'
DATA_STRUCTURE=infer_primary_structure()
class TraceLimit(Exception): pass
def safe_type_name(value):
    try: return type(value).__name__
    except BaseException: return 'object'
def safe_repr(value,limit=180):
    try: text=repr(value)
    except BaseException: text='<'+safe_type_name(value)+'>'
    return text[:limit] if isinstance(text,str) else '<'+safe_type_name(value)+'>'
def safe_key(value):
    try: return str(value)
    except BaseException: return '<'+safe_type_name(value)+' key>'
def norm(value, seen=None, depth=0, budget=None):
    if budget is None: budget=[3000]
    try: return _norm(value,seen,depth,budget)
    except BaseException: return safe_repr(value,240)
def _norm(value, seen=None, depth=0, budget=None):
    if seen is None: seen=set()
    if budget is None: budget=[3000]
    budget[0]-=1
    if budget[0]<0: return '<state truncated>'
    if value is None or isinstance(value,(bool,int,str)): return value
    if isinstance(value,float):
        if value!=value: return 'nan'
        if value==float('inf'): return 'inf'
        if value==float('-inf'): return '-inf'
        return value
    if depth > 5: return safe_repr(value)
    ident=id(value)
    if ident in seen: return '<cycle>'
    try: attrs=object.__getattribute__(value,'__dict__')
    except BaseException: attrs=None
    is_deque=type(value).__module__=='collections' and type(value).__name__=='deque'
    if isinstance(value,(list,tuple,set,frozenset,dict)) or is_deque or (type(attrs) is dict and not isinstance(value,types.ModuleType)):
        seen.add(ident)
        if isinstance(value,dict): result={safe_key(k):norm(v,seen,depth+1,budget) for k,v in list(dict.items(value))[:80]}
        elif isinstance(value,(list,tuple)): result=[norm(v,seen,depth+1,budget) for v in list(value)[:100]]
        elif isinstance(value,(set,frozenset)): result=sorted([norm(v,seen,depth+1,budget) for v in list(value)[:100]],key=safe_repr)
        elif is_deque: result=[norm(v,seen,depth+1,budget) for v in list(value)[:100]]
        else:
            result={'__type__':safe_type_name(value),**{safe_key(k):norm(v,seen,depth+1,budget) for k,v in list(attrs.items())[:80]}}
            result['__id__']=object_token(value)
        seen.remove(ident)
        return result
    return safe_repr(value,240)
def format_for_message(val, depth=0):
    try:
        if val is None: return 'None'
        if isinstance(val, bool): return str(val)
        if isinstance(val, (int, float)): return str(val)
        if isinstance(val, str):
            if len(val) > 30: return repr(val[:27] + '...')
            return repr(val)
        if isinstance(val, dict):
            if '__type__' in val:
                tname = str(val['__type__'])
                for field in ('val', 'value', 'data', 'key'):
                    if field in val and val[field] is not None:
                        inner = format_for_message(val[field], depth + 1) if depth < 1 else str(val[field])
                        return tname + '(' + field + '=' + str(inner) + ')'
                return '<' + tname + '>'
            if not val: return '{}'
            if depth > 0 or len(val) > 2 or any(isinstance(v, (dict, list)) for v in val.values()):
                return '<dict with ' + str(len(val)) + ' entries>'
            items = ', '.join(str(k) + ': ' + format_for_message(v, depth + 1) for k, v in list(val.items())[:2])
            return '{' + items + '}'
        if isinstance(val, (list, tuple)):
            if not val: return '[]' if isinstance(val, list) else '()'
            if depth > 0 or len(val) > 3:
                items = ', '.join(format_for_message(x, depth + 1) for x in val[:2])
                return '[' + items + ', ...]' if isinstance(val, list) else '(' + items + ', ...)'
            items = ', '.join(format_for_message(x, depth + 1) for x in val)
            return '[' + items + ']' if isinstance(val, list) else '(' + items + ')'
        tname = type(val).__name__
        return '<' + tname + '>'
    except BaseException:
        return safe_repr(val, 40)
def json_safe(value,seen=None,depth=0):
    try: return _json_safe(value,seen,depth)
    except BaseException: return safe_repr(value,240)
def _json_safe(value,seen=None,depth=0):
    if seen is None: seen=set()
    if value is None or isinstance(value,(bool,int,str)): return value
    if isinstance(value,float):
        if value!=value: return 'nan'
        if value==float('inf'): return 'inf'
        if value==float('-inf'): return '-inf'
        return value
    if depth>12: return safe_repr(value)
    ident=id(value)
    if ident in seen: return '<cycle>'
    if isinstance(value,dict):
        seen.add(ident)
        result={safe_key(k):json_safe(v,seen,depth+1) for k,v in list(dict.items(value))[:1000]}
        seen.remove(ident)
        return result
    if isinstance(value,(list,tuple,set,frozenset)) or (type(value).__module__=='collections' and type(value).__name__=='deque'):
        seen.add(ident)
        result=[json_safe(v,seen,depth+1) for v in list(value)[:1000]]
        seen.remove(ident)
        return result
    return norm(value)
def is_complex(value):
    if isinstance(value,(dict,list,tuple,set,frozenset)): return True
    try: return type(object.__getattribute__(value,'__dict__')) is dict
    except BaseException: return False
def visible(mapping):
    budget=[3000]
    entries=[(k,v) for k,v in list(mapping.items()) if not safe_key(k).startswith('__') and k not in ('sys','json','linecache','dis','copy','re','types') and not isinstance(v, (type, types.FunctionType, types.BuiltinFunctionType, types.MethodType, types.ModuleType))]
    entries.sort(key=lambda item: is_complex(item[1]))
    result={}
    for key,value in entries: result[safe_key(key)]=norm(value,budget=budget)
    return result
def source_line(line): return SOURCE[line-1].strip() if 0 < line <= len(SOURCE) else ''
def args_for(frame):
    names=frame.f_code.co_varnames[:frame.f_code.co_argcount+frame.f_code.co_kwonlyargcount]
    return {n:norm(frame.f_locals[n]) for n in names if n in frame.f_locals}
def local_state(frame):
    local=visible(frame.f_locals)
    if frame.f_lineno in comprehension_lines:
        for name in comprehension_locals: local.pop(name,None)
    return local
def full_state(frame):
    if frame.f_code.co_name=='<module>': return visible(frame.f_globals)
    state=visible(frame.f_globals)
    state.update(local_state(frame))
    return state
def line_for(frame, inst=None): return inst.positions.lineno if inst and inst.positions and inst.positions.lineno else frame.f_lineno
def classify(source, event_kind='line', inst=None):
    text=source.strip()
    swap=re.match(r'^\s*(\w+)\[([^\]]+)\]\s*,\s*\1\[([^\]]+)\]\s*=\s*\1\[([^\]]+)\]\s*,\s*\1\[([^\]]+)\]',text)
    if swap and swap.group(2).strip()==swap.group(5).strip() and swap.group(3).strip()==swap.group(4).strip(): return 'swap'
    if event_kind=='call': return 'call'
    if event_kind=='return': return 'return'
    if event_kind=='error': return 'error'
    if text.startswith(('if ','elif ','while ')) or re.search(r'\s(?:==|!=|<=|>=|<|>)\s',text): return 'compare'
    if text.startswith('for '): return 'branch'
    if inst:
        op=inst.opname
        if op in ('COMPARE_OP','IS_OP','CONTAINS_OP'): return 'compare'
        if op.startswith('POP_JUMP') or op in ('JUMP_IF_FALSE_OR_POP','JUMP_IF_TRUE_OR_POP'): return 'branch'
        if op=='BINARY_SUBSCR': return 'read'
        if op=='STORE_SUBSCR': return 'write'
        if op.startswith('STORE_'): return 'assign'
        if op.startswith('DELETE_'): return 'delete'
        if op in ('CALL','CALL_FUNCTION','CALL_METHOD'): return method_operation(text)
        if op=='RETURN_VALUE': return 'return'
    return method_operation(text) if method_operation(text)!='line' else 'line'
def method_operation(text):
    t=text.lower()
    if re.search(r'\b(visited|seen|discovered)\.add\s*\(',t): return 'discover'
    deque_method=re.search(r'\b([A-Za-z_]\w*)\.(appendleft|append|popleft|pop|put|get|push|enqueue|dequeue)\s*\(',text)
    if deque_method:
        name,method=deque_method.groups()
        kind=visualize_kinds.get(name,'deque' if name in deque_variables else 'stack' if name in stack_variables else '')
        if kind=='deque' and method in ('appendleft','append','popleft','pop'): return {'appendleft':'enqueue-left','append':'enqueue-right','popleft':'dequeue-left','pop':'dequeue-right'}[method]
        if kind=='stack' and method in ('append','push','pop'): return 'pop' if method=='pop' else 'push'
        if kind=='queue' and method in ('append','put','enqueue','popleft','get','dequeue','pop'): return 'dequeue' if method in ('popleft','get','dequeue','pop') else 'enqueue'
    moved=re.match(r'^\s*(\w+)\s*\[([^]]+)\]\s*=\s*\1\s*\[([^]]+)\]',text)
    if moved and moved.group(2).strip()!=moved.group(3).strip(): return 'move'
    if re.match(r'^\s*\w+\s*\[[^]]+\]\s*=',text): return 'write'
    if re.search(r'^\s*\w+\s*\[[^]]+\]\s*\[[^]]+\]\s*=',text): return 'table-write'
    if re.search(r'\w+\s*\[[^]]+\]\s*\[[^]]+\]',text) and ' = ' not in text: return 'table-read'
    if '.heapify(' in t: return 'update'
    if '.heappush(' in t: return 'push'
    if '.heappop(' in t: return 'pop'
    if re.search(r'\.(append|appendleft|add|insert)\s*\(',t):
        if 'appendleft' in t: return 'enqueue'
        if 'queue' in t or 'deque' in t or re.search(r'\bq\.(append|put)\b',t): return 'enqueue'
        if 'stack' in t: return 'push'
        return 'insert'
    if re.search(r'\.(popleft|pop)\s*\(',t):
        if 'popleft' in t or 'queue' in t or 'deque' in t or re.search(r'\bq\.(get|popleft)\b',t): return 'dequeue'
        if 'stack' in t: return 'pop'
        return 'delete'
    if re.search(r'\.(remove|discard|clear)\s*\(',t): return 'delete'
    if re.search(r'\.(sort|update)\s*\(',t): return 'update'
    if re.search(r'\.(reverse|extend)\s*\(',t): return 'move' if '.reverse(' in t else 'insert'
    if ' = ' in text: return 'assign'
    if '.get(' in t or ' in ' in t: return 'lookup'
    if 'rotate' in t: return 'rotate'
    if 'merge' in t: return 'merge'
    if 'partition' in t: return 'partition'
    return 'line'
def target_names(source):
    names=set()
    try: stmt=ast.parse(source).body[0]
    except Exception: return names
    def collect(node):
        if isinstance(node,ast.Name): names.add(node.id)
        elif isinstance(node,(ast.Subscript,ast.Attribute)): collect(node.value)
        elif isinstance(node,(ast.Tuple,ast.List)):
            for child in node.elts: collect(child)
    if isinstance(stmt,ast.Assign):
        for target in stmt.targets: collect(target)
    elif isinstance(stmt,(ast.AnnAssign,ast.AugAssign)): collect(stmt.target)
    elif isinstance(stmt,ast.Delete):
        for target in stmt.targets: collect(target)
    elif isinstance(stmt,(ast.For,ast.AsyncFor)): collect(stmt.target)
    elif isinstance(stmt,(ast.FunctionDef,ast.AsyncFunctionDef,ast.ClassDef)): names.add(stmt.name)
    elif isinstance(stmt,ast.Import):
        for alias in stmt.names: names.add(alias.asname or alias.name.split('.')[0])
    elif isinstance(stmt,ast.ImportFrom):
        for alias in stmt.names: names.add(alias.asname or alias.name)
    elif isinstance(stmt,ast.Expr) and isinstance(stmt.value,ast.Call) and isinstance(stmt.value.func,ast.Attribute):
        if stmt.value.func.attr in ('append','appendleft','extend','insert','pop','popleft','remove','discard','add','update','clear','sort','reverse','rotate','put','get','enqueue','dequeue','push','delete','union'):
            collect(stmt.value.func.value)
    for child in ast.walk(stmt):
        if isinstance(child,ast.Call) and isinstance(child.func,ast.Attribute):
            if child.func.attr in ('append','appendleft','extend','insert','pop','popleft','remove','discard','add','update','clear','sort','reverse','rotate','put','get','enqueue','dequeue','push','delete','union'):
                collect(child.func.value)
            elif child.func.attr in ('heapify','heappush','heappop') and child.args: collect(child.args[0])
    return names
def mutation_operation(source,before,after,variables):
    try: stmt=ast.parse(source).body[0]
    except Exception: return classify(source)
    if isinstance(stmt,ast.Delete): return 'delete'
    targets=[]
    if isinstance(stmt,ast.Assign): targets=stmt.targets
    elif isinstance(stmt,(ast.AnnAssign,ast.AugAssign)): targets=[stmt.target]
    for target in targets:
        if not isinstance(target,ast.Subscript): continue
        if isinstance(target.value,ast.Subscript): return 'table-write'
        base=target.value
        while isinstance(base,(ast.Subscript,ast.Attribute)): base=base.value
        if not isinstance(base,ast.Name): continue
        name=base.id
        old=before.get(name); new=after.get(name)
        if isinstance(old,dict) and isinstance(new,dict):
            if 'graph' in before and name.lower() in ('dist','distance','distances'): return 'relax'
            key_node=target.slice
            if isinstance(key_node,ast.Constant): key=key_node.value
            elif isinstance(key_node,ast.Name): key=variables.get(key_node.id,'<unknown>')
            else:
                try: key=ast.literal_eval(key_node)
                except Exception: key='<unknown>'
            return 'update' if str(key) in old else 'insert'
        if isinstance(old,list):
            if isinstance(stmt,ast.Assign) and len(targets)==1 and isinstance(stmt.value,ast.Subscript):
                value_base=stmt.value.value
                while isinstance(value_base,(ast.Subscript,ast.Attribute)): value_base=value_base.value
                if isinstance(value_base,ast.Name) and value_base.id==name: return 'move'
            return 'write'
    return classify(source)
def integer_expression(expression,frame):
    try: node=ast.parse(expression,mode='eval').body
    except Exception: return None
    def visit(item):
        if isinstance(item,ast.Constant) and isinstance(item.value,int) and not isinstance(item.value,bool): return item.value
        if isinstance(item,ast.Name):
            value=frame.f_locals.get(item.id,frame.f_globals.get(item.id))
            return value if isinstance(value,int) and not isinstance(value,bool) else None
        if isinstance(item,ast.UnaryOp) and isinstance(item.op,(ast.UAdd,ast.USub)):
            value=visit(item.operand)
            return value if value is None or isinstance(item.op,ast.UAdd) else -value
        if isinstance(item,ast.BinOp) and isinstance(item.op,(ast.Add,ast.Sub,ast.Mult,ast.FloorDiv,ast.Mod)):
            left=visit(item.left); right=visit(item.right)
            if left is None or right is None: return None
            try:
                if isinstance(item.op,ast.Add): return left+right
                if isinstance(item.op,ast.Sub): return left-right
                if isinstance(item.op,ast.Mult): return left*right
                if isinstance(item.op,ast.FloorDiv): return left//right
                return left%right
            except Exception: return None
        return None
    return visit(node)
def matrix_write_starts(source,frame):
    starts=set()
    try: stmt=ast.parse(source).body[0]
    except Exception: return starts
    targets=stmt.targets if isinstance(stmt,ast.Assign) else [stmt.target] if isinstance(stmt,(ast.AnnAssign,ast.AugAssign)) else []
    for target in targets:
        if isinstance(target,ast.Subscript) and isinstance(target.value,ast.Subscript): starts.add(target.col_offset)
    return starts
def infer_focus(source, frame):
    focus={'indices':[],'values':[],'names':[],'cells':[],'readCells':[],'writeCells':[]}
    indexed_names=set()
    nested_names=set()
    write_starts=matrix_write_starts(source,frame)
    for match in re.finditer(r'([A-Za-z_]\w*)\s*\[\s*([^\[\]]+?)\s*\]\s*\[\s*([^\[\]]+?)\s*\]',source):
        name,row_expr,col_expr=match.groups()
        indexed_names.add(name)
        indexed_names.update(re.findall(r'\b[A-Za-z_]\w*\b',row_expr+' '+col_expr))
        nested_names.add(name)
        try:
            row=integer_expression(row_expr,frame); col=integer_expression(col_expr,frame)
            container=frame.f_locals.get(name,frame.f_globals.get(name))
            value=container[row][col]
            display_row=row if row>=0 else len(container)+row
            display_col=col if col>=0 else len(container[row])+col
            cell=[int(display_row),int(display_col)]
            if cell not in focus['cells']: focus['cells'].append(cell)
            if match.start(1) in write_starts:
                if cell not in focus['writeCells']: focus['writeCells'].append(cell)
            elif cell not in focus['readCells']: focus['readCells'].append(cell)
            focus['values'].append(norm(value))
        except Exception: pass
    for match in re.finditer(r'([A-Za-z_]\w*)\s*\[\s*([A-Za-z_]\w*|\d+)(?:\s*([+-])\s*(\d+))?\s*\]',source):
        name,idx_name,sign,delta=match.groups()
        if name in nested_names: continue
        indexed_names.add(name)
        if not idx_name.isdigit(): indexed_names.add(idx_name)
        try:
            container=frame.f_locals.get(name,frame.f_globals.get(name))
            idx=int(idx_name) if idx_name.isdigit() else frame.f_locals.get(idx_name,frame.f_globals.get(idx_name))
            if delta: idx += int(delta)*(1 if sign=='+' else -1)
            value=container[idx]
            if int(idx) not in focus['indices']:
                focus['indices'].append(int(idx)); focus['values'].append(norm(value))
            focus['names'].append(name)
        except Exception: pass
    try:
        stripped_source=source.strip()
        if stripped_source.startswith(('if ','elif ','while ')):
            expression=stripped_source.split(None,1)[1].rstrip(':').strip()
            parsed_source=ast.parse(expression,mode='eval')
        else: parsed_source=ast.parse(source)
        for node in ast.walk(parsed_source):
            if not isinstance(node,ast.Subscript) or not isinstance(node.value,ast.Name): continue
            name=node.value.id
            container=frame.f_locals.get(name,frame.f_globals.get(name))
            if not isinstance(container,str): continue
            if isinstance(node.slice,ast.Slice):
                start=runtime_value(node.slice.lower,frame); stop=runtime_value(node.slice.upper,frame); step=runtime_value(node.slice.step,frame) or 1
                try: indices=list(range(*slice(start,stop,step).indices(len(container))))[:40]
                except BaseException: indices=[]
            else:
                index=runtime_value(node.slice,frame)
                indices=[index] if isinstance(index,int) and not isinstance(index,bool) else []
            for index in indices:
                display_index=index if index>=0 else len(container)+index
                if 0<=display_index<len(container) and display_index not in focus['indices']:
                    focus['indices'].append(display_index)
                    focus['values'].append(container[display_index])
    except BaseException: pass
    if re.search(r'\b(?:index|idx|i|j|left|right|start|position)\b',source):
        for pointer_name in ('index','idx','i','j','left','right','start','position'):
            pointer=frame.f_locals.get(pointer_name)
            if not isinstance(pointer,int) or isinstance(pointer,bool): continue
            for container in frame.f_locals.values():
                if isinstance(container,str) and 0<=pointer<len(container):
                    if pointer not in focus['indices']: focus['indices'].append(pointer); focus['values'].append(container[pointer])
                    break
    if any(op in source for op in ('==','!=','<','>',' in ',' is ')):
        for token in re.findall(r'\b[A-Za-z_]\w*\b',source):
            if token in focus['names'] or token in indexed_names or token in ('if','elif','while','and','or','not','in','is','True','False','None') or token in ('len','range'):
                continue
            if token in frame.f_locals or token in frame.f_globals:
                value=frame.f_locals.get(token,frame.f_globals.get(token))
                if not callable(value) and not isinstance(value,types.ModuleType): focus['names'].append(token); focus['values'].append(norm(value))
    lower=source.lower()
    if 'left' in frame.f_locals and 'right' in frame.f_locals and isinstance(frame.f_locals['left'],int) and isinstance(frame.f_locals['right'],int):
        focus['range']=[frame.f_locals['left'],frame.f_locals['right']]
    elif 'start' in frame.f_locals and 'end' in frame.f_locals and isinstance(frame.f_locals['start'],int) and isinstance(frame.f_locals['end'],int):
        focus['range']=[frame.f_locals['start'],frame.f_locals['end']]
    elif 'start' in frame.f_locals and isinstance(frame.f_locals['start'],int):
        candidate=next((value for value in frame.f_locals.values() if isinstance(value,(list,tuple))),None)
        if candidate: focus['range']=[frame.f_locals['start'],len(candidate)-1]
    elif 'end' in frame.f_locals and isinstance(frame.f_locals['end'],int) and source.startswith('for '):
        focus['range']=[0,frame.f_locals['end']]
    if '.appendleft(' in lower or '.popleft(' in lower or '.pop(0)' in lower: focus['direction']='left'
    elif '.append(' in lower or '.pop(' in lower: focus['direction']='right'
    if not focus['indices']:
        for name in ('i','j','index','left','right','middle','mid','start','end','node','neighbor','item','target'):
            if name in frame.f_locals: focus['names'].append(name)
    return focus
def runtime_value(node,frame):
    try:
        if isinstance(node,ast.Constant): return node.value
        if isinstance(node,ast.Name): return frame.f_locals.get(node.id,frame.f_globals.get(node.id))
        if isinstance(node,(ast.List,ast.Tuple,ast.Set)):
            values=[runtime_value(item,frame) for item in node.elts]
            return values if isinstance(node,(ast.List,ast.Tuple)) else set(values)
        if isinstance(node,ast.Dict): return {runtime_value(key,frame):runtime_value(value,frame) for key,value in zip(node.keys,node.values)}
        if isinstance(node,ast.Subscript): return runtime_value(node.value,frame)[runtime_value(node.slice,frame)]
        if isinstance(node,ast.Slice): return slice(runtime_value(node.lower,frame),runtime_value(node.upper,frame),runtime_value(node.step,frame))
        if isinstance(node,ast.UnaryOp) and isinstance(node.op,(ast.UAdd,ast.USub,ast.Invert)):
            value=runtime_value(node.operand,frame)
            return +value if isinstance(node.op,ast.UAdd) else -value if isinstance(node.op,ast.USub) else ~value
        if isinstance(node,ast.BinOp):
            left=runtime_value(node.left,frame); right=runtime_value(node.right,frame)
            if isinstance(node.op,ast.Add): return left+right
            if isinstance(node.op,ast.Sub): return left-right
            if isinstance(node.op,ast.Mult): return left*right
            if isinstance(node.op,ast.FloorDiv): return left//right
            if isinstance(node.op,ast.Mod): return left%right
        if isinstance(node,ast.Call) and isinstance(node.func,ast.Name):
            values=[runtime_value(argument,frame) for argument in node.args]
            if node.func.id=='len' and values: return len(values[0])
            if node.func.id=='range': return range(*values)
    except BaseException: return None
    return None
def sequence_length(value):
    try: return len(value)
    except BaseException: return None
def deep_size(value,seen=None,depth=0):
    if seen is None: seen=set()
    if depth>8 or value is None or isinstance(value,(bool,int,float,str,bytes)): return 0
    ident=id(value)
    if ident in seen: return 0
    seen.add(ident)
    try:
        if isinstance(value,dict): return len(value)+sum(deep_size(k,seen,depth+1)+deep_size(v,seen,depth+1) for k,v in value.items())
        if isinstance(value,(list,tuple,set,frozenset)) or (type(value).__module__=='collections' and type(value).__name__=='deque'):
            return len(value)+sum(deep_size(item,seen,depth+1) for item in value)
        try: attrs=object.__getattribute__(value,'__dict__')
        except BaseException: attrs=None
        if type(attrs) is dict: return len(attrs)+sum(deep_size(item,seen,depth+1) for item in attrs.values())
        return 0
    except BaseException: return 0
    finally: seen.discard(ident)
def assigned_names(stmt):
    targets=[]
    if isinstance(stmt,ast.Assign): targets=stmt.targets
    elif isinstance(stmt,(ast.AnnAssign,ast.AugAssign)): targets=[stmt.target]
    result=[]
    def collect(node):
        if isinstance(node,ast.Name): result.append(node.id)
        elif isinstance(node,(ast.Tuple,ast.List)):
            for item in node.elts: collect(item)
    for target in targets: collect(target)
    return result
def line_complexity(source,frame,operation,kind,result=None,before=None):
    try:
        if kind=='call' and operation=='call': return {'time':'O(1)','timeDetails':'One user-function invocation','space':'O(1)','spaceDetails':'Added one user-call stack frame'}
        if operation in ('compare','branch','return','error','complete','call'):
            if operation=='return' and result is not None: pass
            else: return {'time':'O(1)','timeDetails':'One control-flow or scalar operation','space':'O(1)','spaceDetails':'No additional auxiliary elements'}
        try: stmt=ast.parse(source).body[0]
        except BaseException: stmt=None
        candidates=[]
        def before_value(node,current):
            if isinstance(node,ast.Name) and isinstance(before,dict) and node.id in before: return before[node.id]
            if isinstance(node,ast.Attribute):
                parent=before_value(node.value,runtime_value(node.value,frame))
                if isinstance(parent,dict): return parent.get(node.attr,current)
            return current
        def iterable_size(node):
            if isinstance(node,(ast.GeneratorExp,ast.ListComp,ast.SetComp,ast.DictComp)):
                total=1
                for generator in node.generators:
                    size=sequence_length(runtime_value(generator.iter,frame))
                    if size is None: return None
                    total*=size
                return total
            return sequence_length(runtime_value(node,frame))
        def add_linear(k,details,allocates=True):
            if k is not None:
                size=max(0,int(k))
                space='O(K)' if allocates else 'O(1)'
                space_details='Allocated '+str(size)+' new elements' if allocates else 'No additional auxiliary elements'
                candidates.append((size,details,'O(K)',space,space_details))
        def inspect(node):
            if isinstance(node,ast.Subscript) and isinstance(node.slice,ast.Slice):
                container=before_value(node.value,runtime_value(node.value,frame))
                length=sequence_length(container)
                if length is not None:
                    try: k=len(range(*runtime_value(node.slice,frame).indices(length)))
                    except BaseException: k=0
                    add_linear(k,'K = '+str(k)+' elements copied by slicing',True)
            if isinstance(node,ast.Call):
                name=node.func.id if isinstance(node.func,ast.Name) else node.func.attr if isinstance(node.func,ast.Attribute) else ''
                args=[runtime_value(argument,frame) for argument in node.args]
                container=runtime_value(node.func.value,frame) if isinstance(node.func,ast.Attribute) else (args[0] if args else None)
                if name in ('heapify','heappush','heappop','deepcopy') and args: container=before_value(node.args[0],args[0])
                elif isinstance(node.func,ast.Attribute): container=before_value(node.func.value,container)
                k=sequence_length(container)
                if name in ('sum','min','max','any','all','sorted') and node.args:
                    k=iterable_size(node.args[0])
                if name in ('sum','min','max','any','all','sorted') and k is not None:
                    if name=='sorted': candidates.append((k,'K = '+str(k)+' input elements sorted','O(K log K)','O(K)','Allocated a sorted copy of '+str(k)+' elements'))
                    else: add_linear(k,'K = '+str(k)+' elements scanned by '+name,False)
                elif name in ('deepcopy','copy') and k is not None: add_linear(deep_size(container) or k,'K = '+str(deep_size(container) or k)+' elements copied',True)
                elif name in ('list','tuple','set','dict') and args and k is not None: add_linear(k,'K = '+str(k)+' elements materialized by '+name,True)
                elif name=='sort' and k is not None: candidates.append((k,'K = '+str(k)+' elements sorted','O(K log K)','O(1)','Sorting is in place') )
                elif name in ('heapify','heappush','heappop') and k is not None:
                    if name=='heapify': add_linear(k,'K = '+str(k)+' elements heapified in place',False)
                    else: candidates.append((k,'K = '+str(k)+' heap elements; one sift operation','O(log K)','O(1)','Heap operation is in place'))
                elif name=='update' and k is not None:
                    count=sequence_length(args[0]) if args else k
                    add_linear(count or k,'K = '+str(count or k)+' entries processed by update',True)
                elif name in ('insert','pop') and isinstance(node.func,ast.Attribute) and k is not None:
                    index=runtime_value(node.args[0],frame) if node.args else (len(container)-1 if name=='pop' else len(container))
                    if name=='insert' or index==0: add_linear(k,'K = '+str(k)+' elements shifted by '+name,False)
                elif name in ('extend','remove','reverse','index','count') and k is not None:
                    add_linear(sequence_length(args[0]) if name=='extend' and args else k,'K = '+str(sequence_length(args[0]) if name=='extend' and args else k)+' elements processed by '+name,name=='extend')
                elif name=='append' and isinstance(node.func,ast.Attribute):
                    candidates.append((1,'One element appended to the end','O(1)','O(1)','No additional auxiliary elements'))
                elif name=='pop' and isinstance(node.func,ast.Attribute) and (not node.args or (args and args[0]==-1)):
                    candidates.append((1,'One element removed from the end','O(1)','O(1)','No additional auxiliary elements'))
                elif name=='join' and isinstance(node.func,ast.Attribute) and k is not None:
                    sequence=args[0] if args else None
                    total=sum(len(value) for value in sequence if isinstance(value,str)) if isinstance(sequence,(list,tuple)) else k
                    add_linear(total,'K = '+str(total)+' output characters joined',True)
            if isinstance(node,ast.BinOp) and isinstance(node.op,(ast.Add,ast.Mult)):
                left=runtime_value(node.left,frame); right=runtime_value(node.right,frame)
                if isinstance(node.op,ast.Add) and isinstance(left,(str,list,tuple)) and isinstance(right,type(left)):
                    k=len(left)+len(right); add_linear(k,'K = '+str(k)+' result elements allocated by concatenation',True)
                elif isinstance(node.op,ast.Mult) and isinstance(left,(str,list,tuple)) and isinstance(right,int):
                    k=len(left)*max(0,right); add_linear(k,'K = '+str(k)+' result elements allocated by repetition',True)
            for child in ast.iter_child_nodes(node): inspect(child)
        if stmt is not None: inspect(stmt)
        if stmt is not None:
            rhs=stmt.value if isinstance(stmt,(ast.Assign,ast.AnnAssign,ast.Return)) else None
            allocates_container=isinstance(rhs,(ast.List,ast.Tuple,ast.Set,ast.Dict,ast.ListComp,ast.SetComp,ast.DictComp,ast.GeneratorExp))
            allocates_container=allocates_container or (isinstance(rhs,ast.BinOp) and isinstance(rhs.op,(ast.Add,ast.Mult)))
            allocates_container=allocates_container or any(isinstance(node,ast.Subscript) and isinstance(node.slice,ast.Slice) for node in ast.walk(rhs)) if rhs is not None else allocates_container
            allocates_container=allocates_container or any(isinstance(node,ast.Call) and ((isinstance(node.func,ast.Name) and node.func.id in ('list','tuple','set','dict','sorted','deepcopy')) or (isinstance(node.func,ast.Attribute) and node.func.attr in ('deepcopy','copy'))) for node in ast.walk(stmt))
            if allocates_container:
                names=assigned_names(stmt)
                if isinstance(stmt,ast.Return): names=[]
                for name in names:
                    value=frame.f_locals.get(name,frame.f_globals.get(name))
                    size=deep_size(value)
                    if size: add_linear(size,'K = '+str(size)+' elements allocated in '+name,True)
                if isinstance(stmt,ast.Return) and result is not None:
                    size=deep_size(result)
                    if size: add_linear(size,'K = '+str(size)+' elements allocated by return',True)
        if candidates:
            order={'O(1)':0,'O(log K)':1,'O(K)':2,'O(K log K)':3}
            candidate=max(candidates,key=lambda item:(order.get(item[2],1),item[0]))
            k,details,time_complexity,space_complexity,space_details=candidate
            time_res='O(1)' if time_complexity in (None,'O(?)','?') else time_complexity
            space_res='O(1)' if space_complexity in (None,'O(?)','?') else space_complexity
            return {'time':time_res,'timeDetails':details,'space':space_res,'spaceDetails':space_details}
        def simple_scalar(node):
            if node is None: return False
            if isinstance(node,(ast.Constant,ast.Name,ast.Attribute)): return True
            if isinstance(node,ast.Subscript): return not isinstance(node.slice,ast.Slice) and simple_scalar(node.value) and simple_scalar(node.slice)
            if isinstance(node,ast.UnaryOp): return simple_scalar(node.operand)
            if isinstance(node,ast.BinOp): return simple_scalar(node.left) and simple_scalar(node.right)
            if isinstance(node,ast.BoolOp): return all(simple_scalar(value) for value in node.values)
            if isinstance(node,ast.Compare): return simple_scalar(node.left) and all(simple_scalar(value) for value in node.comparators)
            if isinstance(node,ast.IfExp): return simple_scalar(node.test) and simple_scalar(node.body) and simple_scalar(node.orelse)
            if isinstance(node,ast.Call) and isinstance(node.func,ast.Name) and node.func.id in ('abs','bool','float','int','len','range','str','ord','chr','round'):
                return all(simple_scalar(argument) for argument in node.args)
            return False
        rhs=stmt.value if isinstance(stmt,(ast.Assign,ast.AnnAssign,ast.AugAssign,ast.Return)) else None if stmt is not None else None
        if operation=='assign' and simple_scalar(rhs):
            return {'time':'O(1)','timeDetails':'Scalar assignment or arithmetic operation','space':'O(1)','spaceDetails':'No additional auxiliary elements'}
        constant_operations={'read','write','table-read','table-write','move','swap','insert','delete','push','pop','enqueue','dequeue','enqueue-left','enqueue-right','dequeue-left','dequeue-right','visit','discover','relax','rotate','partition','merge','split','lookup','backtrack','branch','compare','call','return','output'}
        if operation in constant_operations:
            return {'time':'O(1)','timeDetails':'One scalar, pointer, or amortized container operation','space':'O(1)','spaceDetails':'No additional auxiliary elements'}
        return {'time':'O(1)','timeDetails':'Conservative fallback estimate for an unmodeled operation','space':'O(1)','spaceDetails':'Conservative fallback; allocation was not detected'}
    except BaseException:
        return {'time':'O(1)','timeDetails':'Conservative fallback estimate for an unmodeled operation','space':'O(1)','spaceDetails':'Conservative fallback; allocation was not detected'}

def add_event(frame, kind, op, before=None, after=None, inst=None, result=None, branch=None, line_override=None, source_override=None, variables_override=None, globals_override=None, arguments_override=None, focus_override=None, output_override=None):
    if frame.f_code.co_filename!='<exec>' or (frame.f_code.co_name.startswith('<') and frame.f_code.co_name!='<module>') or frame.f_code.co_name in ignored_scopes: return
    event_line=line_override if line_override is not None else line_for(frame,inst)
    if not recording or (event_line in ignored_lines and op not in ('call','error')): return
    if op in ('line','read','lookup') or (kind=='mutation' and before==after) or (op=='return' and result is None): return
    if frame.f_code.co_name=='<module>' and defer_module_events and op=='branch': return
    if len(events)>=event_limit-1: raise TraceLimit('Trace stopped after '+str(event_limit)+' meaningful events.')
    line=line_override if line_override is not None else line_for(frame,inst)
    statement=source_override if source_override is not None else source_line(line)
    local=variables_override if variables_override is not None else local_state(frame)
    global_values=globals_override if globals_override is not None else (visible(frame.f_globals) if frame.f_code.co_name!='<module>' else {})
    arguments=arguments_override if arguments_override is not None else args_for(frame)
    call_stack=[{'name':f.f_code.co_name,'line':f.f_lineno,'arguments':args_for(f)} for f in frames]
    if line_override is not None and call_stack and call_stack[-1]['name']==frame.f_code.co_name: call_stack[-1]['line']=line_override
    if arguments_override is not None and call_stack and call_stack[-1]['name']==frame.f_code.co_name: call_stack[-1]['arguments']=arguments_override
    focus=focus_override if focus_override is not None else infer_focus(statement,frame)
    if branch is not None: focus['result']='taken' if branch else 'not taken'
    item={'step':len(events)+1,'line':line,'statement':statement,'eventType':op,'operation':op,'function':frame.f_code.co_name,'depth':max(0,len(frames)-1),'variables':local,'globals':global_values,'arguments':arguments,'beforeState':before if before is not None else full_state(frame),'afterState':after if after is not None else full_state(frame),'state':after if after is not None else full_state(frame),'focus':focus,'explanation':'','message':'','callStack':call_stack,'lineComplexity':line_complexity(statement,frame,op,kind,result,before),'dataStructure':DATA_STRUCTURE,'visualizerType':DATA_STRUCTURE}
    if op=='return': item['returnValue']=norm(result)
    elif result is not None and op!='error': item['returnValue']=norm(result)
    if output_override is not None: item['output']=output_override
    if op=='compare' and focus['values']: item['explanation']='Comparing '+', '.join(format_for_message(v) for v in focus['values'])
    elif op=='assign':
        assign_targets=target_names(statement)
        after_vals=after if after is not None else full_state(frame)
        before_vals=before if before is not None else {}
        changed=[t for t in assign_targets if t in after_vals and (t not in before_vals or before_vals[t]!=after_vals[t])]
        if changed and len(changed)<=2:
            item['explanation']='Assign · '+', '.join(str(t)+' = '+format_for_message(after_vals[t]) for t in changed)
        else:
            item['explanation']='Assign · '+statement
    elif op=='branch' and branch is not None: item['explanation']='Condition '+('was true; branch taken' if branch else 'was false; branch skipped')
    elif op in ('call','return'): item['explanation']=('Calling ' if op=='call' else 'Returning from ')+frame.f_code.co_name
    elif op=='error': item['explanation']=str(result or statement)
    elif output_override is not None: item['explanation']='Program output: '+output_override.strip()
    elif before!=after and op not in ('line','assign'): item['explanation']=op.title()+' changed the data structure state'
    else: item['explanation']=(op.title()+' · ' if op!='line' else 'Executing · ')+statement
    item['message']=item['explanation']
    events.append(item)
def get_inst(frame):
    code=frame.f_code
    if code not in instruction_maps: instruction_maps[code]={i.offset:i for i in dis.get_instructions(code)}
    return instruction_maps[code].get(frame.f_lasti)
def commit_previous(frame):
    prior=last_by_frame.get(id(frame))
    after=full_state(frame)
    if not prior: return
    inst,before,prior_source,prior_line=prior
    if before!=after:
        src=prior_source or source_line(line_for(frame,inst))
        targets=target_names(src)
        operation=classify(src,'opcode',inst) if inst is not None else mutation_operation(src,before,after,last_context.get(id(frame),{}).get('variables') or {})
        if inst is not None:
            op=operation
            if op in ('line','read','compare','branch','call','return'): op=method_operation(src) if method_operation(src)!='line' else ('write' if inst.opname=='STORE_SUBSCR' else 'assign')
        else:
            op=operation
            if op in ('line','compare','branch','call','return'): op='assign' if targets else 'line'
        context=last_context.get(id(frame),{})
        if op not in ('line','read','lookup'):
            primary=dict(before)
            for name in targets:
                if name in after: primary[name]=after[name]
                else: primary.pop(name,None)
            variables=dict(context.get('variables') or {})
            for name in targets:
                if name in after: variables[name]=after[name]
                else: variables.pop(name,None)
            focus=infer_focus(src,frame)
            add_event(frame,'mutation',op,before,primary,inst,line_override=prior_line or None,source_override=src,variables_override=variables,globals_override=context.get('globals'),arguments_override=context.get('arguments'),focus_override=focus)
            remainder_before=dict(primary)
            for name in targets:
                if name in before: remainder_before[name]=before[name]
                else: remainder_before.pop(name,None)
            extras={name for name in set(before)|set(after) if before.get(name,'<missing>')!=after.get(name,'<missing>') and name not in targets}
            if extras and targets:
                current_line=frame.f_lineno
                current_source=source_line(current_line)
                current_vars=local_state(frame)
                next_op='assign' if any(name in frame.f_locals for name in extras) else 'update'
                add_event(frame,'mutation',next_op,remainder_before,after,line_override=current_line,source_override=current_source,variables_override=current_vars,globals_override=visible(frame.f_globals) if frame.f_code.co_name!='<module>' else {},arguments_override=args_for(frame),focus_override=infer_focus(current_source,frame))
    context=last_context.get(id(frame),{})
    printed=stdout_buffer.getvalue()
    output_chunk=printed[context.get('output_size',0):]
    if output_chunk:
        state_now=full_state(frame)
        add_event(frame,'output','write',state_now,state_now,line_override=prior[3] or None,source_override=prior[2],variables_override=context.get('variables'),globals_override=context.get('globals'),arguments_override=context.get('arguments'),focus_override=context.get('focus'),output_override=output_chunk)
        context['output_size']=len(printed)
def tracer(frame,event,arg):
    global op_count
    global recording
    if frame.f_code.co_filename!='<exec>' or (frame.f_code.co_name.startswith('<') and frame.f_code.co_name!='<module>') or frame.f_code.co_name in ignored_scopes: return None
    if event in ('call','line','opcode') and time.monotonic()>execution_deadline:
        raise TraceLimit('Execution timed out after '+str(EXECUTION_TIMEOUT_MS/1000)+' seconds.')
    if event=='call':
        op_count+=1
        if op_count>300000: raise TraceLimit('Execution stopped after 300,000 traced source callbacks (possible infinite loop).')
        if len(frames)>=128: raise TraceLimit('Execution stopped after 128 nested user calls (possible runaway recursion).')
        frames.append(frame)
        frame.f_trace_opcodes=False
        frame.f_trace_lines=True
        if frame.f_code.co_name!='<module>' and defer_module_events and not recording: recording=True
        if frame.f_code.co_name!='<module>':
            caller=frame.f_back
            call_line=caller.f_lineno if caller and caller.f_code.co_filename=='<exec>' else None
            call_source=source_line(call_line) if call_line else None
            add_event(frame,'call','call',{},full_state(frame),line_override=call_line,source_override=call_source)
        last_by_frame[id(frame)]=(None,full_state(frame),'',0)
        last_context[id(frame)]={'variables':local_state(frame),'globals':visible(frame.f_globals) if frame.f_code.co_name!='<module>' else {},'arguments':args_for(frame),'focus':infer_focus('',frame),'output_size':len(stdout_buffer.getvalue())}
    elif event=='line':
        op_count+=1
        if op_count>300000: raise TraceLimit('Execution stopped after 300,000 traced source callbacks (possible infinite loop).')
        commit_previous(frame)
        if frame.f_lineno in ignored_lines: return tracer
        pending=pending_conditions.pop(id(frame),None)
        if pending:
            pending_line,pending_source,pending_indent,pending_state=pending
            current_source=source_line(frame.f_lineno)
            raw_current=SOURCE[frame.f_lineno-1] if 0 < frame.f_lineno <= len(SOURCE) else current_source
            current_indent=len(raw_current)-len(raw_current.lstrip())
            taken=current_indent>pending_indent
            add_event(frame,'branch','branch',pending_state,full_state(frame),branch=taken,line_override=pending_line,source_override=pending_source)
        before=full_state(frame)
        src=source_line(frame.f_lineno)
        if classify(src)=='compare': add_event(frame,'line','compare',before,before)
        if src.startswith(('if ','elif ','while ','for ')):
            raw_source=SOURCE[frame.f_lineno-1] if 0 < frame.f_lineno <= len(SOURCE) else src
            indent=len(raw_source)-len(raw_source.lstrip())
            pending_conditions[id(frame)]=(frame.f_lineno,src,indent,before)
        last_by_frame[id(frame)]=(None,before,src,frame.f_lineno)
        last_context[id(frame)]={'variables':local_state(frame),'globals':visible(frame.f_globals) if frame.f_code.co_name!='<module>' else {},'arguments':args_for(frame),'focus':infer_focus(src,frame),'output_size':len(stdout_buffer.getvalue())}
    elif event=='opcode':
        op_count+=1
        if op_count>300000: raise TraceLimit('Execution stopped after 300,000 Python instructions (possible infinite loop).')
        commit_previous(frame)
        inst=get_inst(frame)
        before=full_state(frame)
        if inst and inst.opname in ('COMPARE_OP','IS_OP','CONTAINS_OP'):
            add_event(frame,'compare','compare',before,before,inst)
        last_by_frame[id(frame)]=(inst,before,source_line(line_for(frame,inst)),line_for(frame,inst))
        last_context[id(frame)]={'variables':local_state(frame),'globals':visible(frame.f_globals) if frame.f_code.co_name!='<module>' else {},'arguments':args_for(frame),'focus':infer_focus(source_line(line_for(frame,inst)),frame),'output_size':len(stdout_buffer.getvalue())}
    elif event=='return':
        commit_previous(frame)
        if arg is not None: add_event(frame,'return','return',full_state(frame),full_state(frame),get_inst(frame),arg)
        last_by_frame.pop(id(frame),None)
        last_context.pop(id(frame),None)
        pending_conditions.pop(id(frame),None)
        if frames and frames[-1] is frame: frames.pop()
    elif event=='exception':
        exc=arg[1]
        if not isinstance(exc,TraceLimit) and id(exc) not in reported_exceptions:
            reported_exceptions.add(id(exc))
            err_line=frame.f_lineno
            err_msg=str(exc) or type(exc).__name__
            formatted_err=f"Execution Error: {err_msg} at line {err_line}" if not str(exc).startswith('Execution Error:') else str(exc)
            add_event(frame,'error','error',full_state(frame),full_state(frame),get_inst(frame),formatted_err)
    return tracer
namespace={'__name__':'__main__'}
stdout_buffer=io.StringIO()
program_error=False
try:
    sys.settrace(tracer)
    with contextlib.redirect_stdout(stdout_buffer): exec(compile(USER_CODE,'<exec>','exec'),namespace,namespace)
except BaseException as exc:
    sys.settrace(None)
    program_error=True
    frame=frames[-1] if frames else None
    existing_error=next((item for item in reversed(events) if item.get('eventType')=='error'),None)
    err_line=getattr(exc,'lineno',None)
    if not err_line:
        tb=getattr(exc,'__traceback__',None)
        if tb and tb.tb_next:
            curr=tb.tb_next
            while curr:
                if curr.tb_frame.f_code.co_filename=='<exec>': err_line=curr.tb_lineno
                curr=curr.tb_next
    if not err_line and frame: err_line=frame.f_lineno
    err_msg=str(exc) or type(exc).__name__
    line_part=f" at line {err_line}" if err_line else ""
    if isinstance(exc,TraceLimit):
        explanation=str(exc)
    elif str(exc).startswith('Execution Error:'):
        explanation=str(exc)
    elif existing_error and 'at line' in existing_error.get('explanation',''):
        explanation=existing_error['explanation']
    else:
        explanation=f"Execution Error: {err_msg}{line_part}"
    if existing_error:
        terminal=dict(existing_error); terminal['step']=len(events)+1; terminal['explanation']=explanation; terminal['message']=explanation; events.append(terminal)
    elif frame:
        try: add_event(frame,'error','error',full_state(frame),full_state(frame),get_inst(frame),explanation)
        except Exception:
            events.append({'step':len(events)+1,'line':err_line or 0,'statement':source_line(err_line or 0),'eventType':'error','operation':'error','function':frame.f_code.co_name,'depth':max(0,len(frames)-1),'variables':local_state(frame),'globals':visible(frame.f_globals),'arguments':args_for(frame),'beforeState':full_state(frame),'afterState':full_state(frame),'state':full_state(frame),'focus':{},'explanation':explanation,'message':explanation,'callStack':[],'lineComplexity':{'time':'O(1)','timeDetails':'Terminal error reporting','space':'O(1)','spaceDetails':'No additional auxiliary elements'},'dataStructure':DATA_STRUCTURE,'visualizerType':DATA_STRUCTURE})
    else:
        error_line=err_line or getattr(exc,'lineno',0) or 0
        error_statement=(getattr(exc,'text',None) or source_line(error_line)).strip()
        if isinstance(exc,SyntaxError) and 'line continuation character' in str(exc).lower() and r'\n' in error_statement:
            explanation += " — this line contains a literal backslash-n sequence. Replace it with an actual line break between statements."
        events.append({'step':len(events)+1,'line':error_line,'statement':error_statement,'eventType':'error','operation':'error','function':'<module>','depth':0,'variables':{},'globals':{},'arguments':{},'beforeState':{},'afterState':{},'state':{},'focus':{},'explanation':explanation,'message':explanation,'callStack':[],'lineComplexity':{'time':'O(1)','timeDetails':'Terminal error reporting','space':'O(1)','spaceDetails':'No additional auxiliary elements'},'dataStructure':DATA_STRUCTURE,'visualizerType':DATA_STRUCTURE})
finally:
    sys.settrace(None)
if not program_error:
    events.append({'step':len(events)+1,'line':len(SOURCE),'statement':'','eventType':'complete','operation':'complete','function':'<module>','depth':0,'variables':visible(namespace),'globals':{},'arguments':{},'beforeState':{},'afterState':visible(namespace),'state':visible(namespace),'focus':{},'explanation':'Program completed','message':'Program completed','callStack':[],'lineComplexity':{'time':'O(1)','timeDetails':'Trace completion bookkeeping','space':'O(1)','spaceDetails':'No additional auxiliary elements'},'dataStructure':DATA_STRUCTURE,'visualizerType':DATA_STRUCTURE})
json.dumps(json_safe(events),allow_nan=False)`;

export async function tracePython(code: string): Promise<TraceEvent[]> {
  try {
    const py = await loadPython();
    const runner = buildTraceProgram(code);
    const raw = await py.runPythonAsync(runner);
    const parsed = JSON.parse(String(raw)) as Array<Omit<TraceEvent, 'structure'>>;
    return attachDataStructure(parsed, code);
  } catch (err: any) {
    const msg = err instanceof Error ? err.message : String(err);
    const cleanMsg = msg.startsWith('Execution Error:') ? msg : `Execution Error: ${msg}`;
    const fallbackEvent: TraceEvent = {
      step: 1,
      line: 1,
      statement: code.split('\n')[0] || '',
      eventType: 'error',
      operation: 'error',
      function: '<module>',
      depth: 0,
      variables: {},
      globals: {},
      arguments: {},
      beforeState: {},
      afterState: {},
      state: {},
      focus: {},
      explanation: cleanMsg,
      message: cleanMsg,
      callStack: [],
      lineComplexity: { time: 'O(1)', timeDetails: 'Terminal error reporting', space: 'O(1)', spaceDetails: 'No additional auxiliary elements' },
      structure: 'generic',
      dataStructure: 'generic',
      visualizerType: 'generic',
    };
    return [fallbackEvent];
  }
}

export function attachDataStructure(events: Array<Omit<TraceEvent, 'structure'>>, source: string): TraceEvent[] {
    return events.map(event => {
        const rawDs = (event as any).visualizerType || event.dataStructure || detectStructure(event, source);
        const dataStructure = normalizeStructure(rawDs === 'variables' ? 'generic' : rawDs);
        const visualizerType = dataStructure;
        const rawComplexity = (event as any).lineComplexity;
        const time = rawComplexity?.time && rawComplexity.time !== 'O(?)' && rawComplexity.time !== '?' ? rawComplexity.time : 'O(1)';
        const space = rawComplexity?.space && rawComplexity.space !== 'O(?)' && rawComplexity.space !== '?' ? rawComplexity.space : 'O(1)';
        const timeDetails = rawComplexity?.timeDetails && !rawComplexity.timeDetails.includes('not covered') && !rawComplexity.timeDetails.includes('O(?)')
            ? rawComplexity.timeDetails
            : 'Conservative fallback estimate for an unmodeled operation';
        const spaceDetails = rawComplexity?.spaceDetails && !rawComplexity.spaceDetails.includes('not covered') && !rawComplexity.spaceDetails.includes('O(?)')
            ? rawComplexity.spaceDetails
            : 'No additional auxiliary elements';
        const lineComplexity = { time, timeDetails, space, spaceDetails };
        const message = (event as any).message || event.explanation;
        return { ...event, structure: dataStructure, dataStructure, visualizerType, message, lineComplexity };
    });
}

export function buildTraceProgram(code: string, eventLimit = 1000, executionTimeoutMs = 5000): string {
    return PYTHON_TRACE.replace('__USER_CODE__', JSON.stringify(preparePython(code))).replace('__EVENT_LIMIT__', String(eventLimit)).replace('__EXECUTION_TIMEOUT_MS__', String(executionTimeoutMs));
}
