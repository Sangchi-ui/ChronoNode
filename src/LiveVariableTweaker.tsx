import React, { useState, useRef, useEffect } from 'react';
import {
  Pause,
  Play,
  SkipForward,
  RotateCcw,
  Sliders,
  Sparkles,
  Edit3,
  Check,
  AlertCircle,
  Cpu,
} from 'lucide-react';

export interface ExecutionCheckpoint {
  step: number;
  phase: string;
  description: string;
  line: string;
  activeIndices: number[];
  isComparison: boolean;
  isSwap: boolean;
  memoryArray: number[];
  variables: Record<string, number | string | boolean>;
  isDone: boolean;
}

// 1. Bubble Sort Generator
function* bubbleSortGenerator(arr: number[]): Generator<ExecutionCheckpoint, ExecutionCheckpoint, void> {
  let step = 1;
  const n = arr.length;
  for (let end = n - 1; end > 0; end--) {
    for (let j = 0; j < end; j++) {
      // Comparison Checkpoint
      yield {
        step: step++,
        phase: `Pass ${n - end}: Compare adjacent elements`,
        description: `Comparing arr[${j}] (${arr[j]}) with arr[${j + 1}] (${arr[j + 1]})`,
        line: `if arr[${j}] > arr[${j + 1}]:`,
        activeIndices: [j, j + 1],
        isComparison: true,
        isSwap: false,
        memoryArray: arr,
        variables: { end, j, 'arr[j]': arr[j], 'arr[j+1]': arr[j + 1] },
        isDone: false,
      };

      if (arr[j] > arr[j + 1]) {
        const temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;

        // Swap Checkpoint
        yield {
          step: step++,
          phase: `Pass ${n - end}: Swapped inverted elements`,
          description: `Swapped arr[${j}] and arr[${j + 1}] -> now [${arr[j]}, ${arr[j + 1]}]`,
          line: `arr[${j}], arr[${j + 1}] = arr[${j + 1}], arr[${j}]`,
          activeIndices: [j, j + 1],
          isComparison: false,
          isSwap: true,
          memoryArray: arr,
          variables: { end, j, 'arr[j]': arr[j], 'arr[j+1]': arr[j + 1] },
          isDone: false,
        };
      }
    }
  }

  return {
    step: step++,
    phase: 'Sort Complete',
    description: 'All passes completed. Array is fully sorted!',
    line: 'return arr',
    activeIndices: [],
    isComparison: false,
    isSwap: false,
    memoryArray: arr,
    variables: { status: 'Sorted' },
    isDone: true,
  };
}

// 2. Insertion Sort Generator
function* insertionSortGenerator(arr: number[]): Generator<ExecutionCheckpoint, ExecutionCheckpoint, void> {
  let step = 1;
  const n = arr.length;
  for (let i = 1; i < n; i++) {
    const key = arr[i];
    let j = i - 1;

    yield {
      step: step++,
      phase: `Insert Element at Index ${i}`,
      description: `Picking key = ${key} at index ${i} to insert into sorted prefix.`,
      line: `key = arr[${i}]`,
      activeIndices: [i],
      isComparison: false,
      isSwap: false,
      memoryArray: arr,
      variables: { i, key },
      isDone: false,
    };

    while (j >= 0 && arr[j] > key) {
      yield {
        step: step++,
        phase: `Shift arr[${j}] Right`,
        description: `arr[${j}] (${arr[j]}) > key (${key}), shifting to index ${j + 1}.`,
        line: `arr[${j + 1}] = arr[${j}]`,
        activeIndices: [j, j + 1],
        isComparison: true,
        isSwap: true,
        memoryArray: arr,
        variables: { i, j, key },
        isDone: false,
      };
      arr[j + 1] = arr[j];
      j--;
    }

    arr[j + 1] = key;
    yield {
      step: step++,
      phase: `Place Key at Index ${j + 1}`,
      description: `Inserted key (${key}) into slot ${j + 1}.`,
      line: `arr[${j + 1}] = key`,
      activeIndices: [j + 1],
      isComparison: false,
      isSwap: true,
      memoryArray: arr,
      variables: { i, insertedSlot: j + 1, key },
      isDone: false,
    };
  }

  return {
    step: step++,
    phase: 'Insertion Sort Complete',
    description: 'Array is in sorted order.',
    line: 'return arr',
    activeIndices: [],
    isComparison: false,
    isSwap: false,
    memoryArray: arr,
    variables: { status: 'Complete' },
    isDone: true,
  };
}

// 3. Two-Pointer Generator (Pair Sum)
function* twoPointerGenerator(arr: number[], target = 50): Generator<ExecutionCheckpoint, ExecutionCheckpoint, void> {
  let step = 1;
  let left = 0;
  let right = arr.length - 1;

  while (left < right) {
    const sum = arr[left] + arr[right];
    yield {
      step: step++,
      phase: `Evaluate Two-Pointer Sum`,
      description: `left = ${left} (${arr[left]}), right = ${right} (${arr[right]}). Sum = ${sum} (target: ${target})`,
      line: `sum = arr[left] + arr[right]`,
      activeIndices: [left, right],
      isComparison: true,
      isSwap: false,
      memoryArray: arr,
      variables: { left, right, sum, target },
      isDone: false,
    };

    if (sum === target) {
      return {
        step: step++,
        phase: `Target Found!`,
        description: `arr[${left}] (${arr[left]}) + arr[${right}] (${arr[right]}) == ${target}!`,
        line: `return (left, right)`,
        activeIndices: [left, right],
        isComparison: false,
        isSwap: false,
        memoryArray: arr,
        variables: { left, right, sum, target, found: true },
        isDone: true,
      };
    }

    if (sum < target) {
      left++;
    } else {
      right--;
    }
  }

  return {
    step: step++,
    phase: `Search Finished`,
    description: `No pair found summing to ${target}.`,
    line: `return None`,
    activeIndices: [],
    isComparison: false,
    isSwap: false,
    memoryArray: arr,
    variables: { found: false },
    isDone: true,
  };
}

export function LiveVariableTweaker() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>('Bubble Sort');
  const [memorySlots, setMemorySlots] = useState<number[]>([45, 12, 89, 34, 23, 76, 5]);
  const [isPausedCheckpoint, setIsPausedCheckpoint] = useState<boolean>(true);
  const [autoPlaying, setAutoPlaying] = useState<boolean>(false);
  const [checkpoint, setCheckpoint] = useState<ExecutionCheckpoint | null>(null);
  const [mutationMessage, setMutationMessage] = useState<string | null>(null);

  const generatorRef = useRef<Generator<ExecutionCheckpoint, ExecutionCheckpoint, void> | null>(null);
  const autoPlayTimerRef = useRef<number | null>(null);

  // Initialize Generator
  const initGenerator = () => {
    const memoryCopy = [...memorySlots];
    let gen: Generator<ExecutionCheckpoint, ExecutionCheckpoint, void>;
    if (selectedAlgorithm === 'Insertion Sort') {
      gen = insertionSortGenerator(memoryCopy);
    } else if (selectedAlgorithm === 'Two-Pointer') {
      const sorted = [...memoryCopy].sort((a, b) => a - b);
      setMemorySlots(sorted);
      gen = twoPointerGenerator(sorted, 57);
    } else {
      gen = bubbleSortGenerator(memoryCopy);
    }
    generatorRef.current = gen;
    const first = gen.next();
    if (!first.done) {
      setCheckpoint(first.value);
    }
    setIsPausedCheckpoint(true);
    setAutoPlaying(false);
  };

  useEffect(() => {
    initGenerator();
    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, [selectedAlgorithm]);

  // Step forward using .next()
  const stepNext = () => {
    if (!generatorRef.current) return;
    const res = generatorRef.current.next();
    if (res.done) {
      setCheckpoint(res.value);
      setAutoPlaying(false);
    } else {
      setCheckpoint(res.value);
      // Synchronize memorySlots with the generator's underlying array
      setMemorySlots([...res.value.memoryArray]);
    }
  };

  // Auto-play / pause toggle
  useEffect(() => {
    if (autoPlaying && !checkpoint?.isDone) {
      autoPlayTimerRef.current = window.setInterval(() => {
        if (!generatorRef.current) return;
        const res = generatorRef.current.next();
        if (res.done) {
          setCheckpoint(res.value);
          setAutoPlaying(false);
        } else {
          setCheckpoint(res.value);
          setMemorySlots([...res.value.memoryArray]);
        }
      }, 700);
    } else {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    }
    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, [autoPlaying, checkpoint?.isDone]);

  // Mutate an array slot in-place mid-execution!
  const handleSlotChange = (index: number, newVal: number) => {
    if (isNaN(newVal)) return;
    // 1. Update React state
    const updated = [...memorySlots];
    updated[index] = newVal;
    setMemorySlots(updated);

    // 2. Mutate in-place inside the generator's active memory reference!
    if (checkpoint?.memoryArray) {
      checkpoint.memoryArray[index] = newVal;
    }

    setMutationMessage(`Mutated slot [${index}] to ${newVal} in live generator memory!`);
    setTimeout(() => setMutationMessage(null), 3000);
  };

  return (
    <div className="tweaker-container" aria-label="Live Variable Tweaking Panel">
      <div className="tweaker-header">
        <div className="tweaker-title-block">
          <span className="tweaker-badge">
            <Sliders size={13} /> GENERATOR STATE MACHINE
          </span>
          <h3>Live Variable Tweaking Mid-Execution</h3>
        </div>

        <div className="tweaker-algo-select">
          <label htmlFor="tweaker-algo">Algorithm:</label>
          <select
            id="tweaker-algo"
            value={selectedAlgorithm}
            onChange={(e) => setSelectedAlgorithm(e.target.value)}
          >
            <option>Bubble Sort</option>
            <option>Insertion Sort</option>
            <option>Two-Pointer</option>
          </select>
        </div>
      </div>

      {/* Control Strip */}
      <div className="tweaker-controls-bar">
        <div className="controls-left">
          <button
            className={`checkpoint-btn ${isPausedCheckpoint ? 'active' : ''}`}
            onClick={() => {
              setIsPausedCheckpoint((prev) => !prev);
              setAutoPlaying(false);
            }}
            title="Unlock HTML inputs to tweak memory slots"
          >
            <Edit3 size={14} />
            {isPausedCheckpoint ? 'Checkpoint Unlocked (Editable)' : 'Pause at Checkpoint'}
          </button>

          <button
            className="step-btn"
            disabled={checkpoint?.isDone}
            onClick={() => {
              setAutoPlaying(false);
              stepNext();
            }}
          >
            <SkipForward size={14} /> Step (`.next()`)
          </button>

          <button
            className={`play-btn ${autoPlaying ? 'is-playing' : ''}`}
            disabled={checkpoint?.isDone}
            onClick={() => setAutoPlaying((p) => !p)}
          >
            {autoPlaying ? <Pause size={14} /> : <Play size={14} />}
            {autoPlaying ? 'Pause' : 'Resume'}
          </button>

          <button className="reset-btn" onClick={initGenerator} title="Reset generator">
            <RotateCcw size={14} /> Reset
          </button>
        </div>

        <div className="step-readout">
          <span className="step-tag">Step {checkpoint?.step ?? 0}</span>
          <span className="phase-text">{checkpoint?.phase || 'Ready'}</span>
        </div>
      </div>

      {/* In-Memory Interactive Array Tape */}
      <div className="tweaker-tape-section">
        <div className="tape-header">
          <span className="tape-label">
            IN-MEMORY ARRAY SLOTS {isPausedCheckpoint && <small>(Editable Inputs)</small>}
          </span>
          {mutationMessage && (
            <span className="mutation-toast">
              <Check size={12} /> {mutationMessage}
            </span>
          )}
        </div>

        <div className="tweaker-cells-row">
          {memorySlots.map((val, idx) => {
            const isActive = checkpoint?.activeIndices.includes(idx);
            const isCompared = isActive && checkpoint?.isComparison;
            const isSwapped = isActive && checkpoint?.isSwap;

            return (
              <div
                key={idx}
                className={`tweaker-cell-card ${isCompared ? 'is-compared' : ''} ${
                  isSwapped ? 'is-swapped' : ''
                } ${isActive ? 'is-active' : ''}`}
              >
                <div className="cell-idx">idx {idx}</div>
                {isPausedCheckpoint ? (
                  <input
                    type="number"
                    className="cell-input"
                    value={val}
                    onChange={(e) => handleSlotChange(idx, Number(e.target.value))}
                    aria-label={`Slot ${idx}`}
                    title="Click and type to tweak this variable slot in-place!"
                  />
                ) : (
                  <div className="cell-val">{val}</div>
                )}
                {isActive && (
                  <span className="cell-pointer-flag">
                    {checkpoint?.isSwap ? 'SWAP' : 'EVAL'}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Explanatory Operation Card */}
      <div className="tweaker-details-box">
        <div className="tweaker-code-line">
          <span className="code-eyebrow">YIELDED LINE:</span>
          <code>{checkpoint?.line || '—'}</code>
        </div>
        <p className="tweaker-explanation-p">
          {checkpoint?.description || 'Generator ready. Step through or edit variables.'}
        </p>

        {checkpoint?.variables && (
          <div className="tweaker-vars-grid">
            {Object.entries(checkpoint.variables).map(([k, v]) => (
              <div className="var-chip" key={k}>
                <code>{k}</code> = <b>{String(v)}</b>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
