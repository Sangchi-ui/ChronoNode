import { describe, expect, it } from 'vitest';
import { resolveVisualizerRoute, visualizerRoutes } from './visualizer-routing';

describe('visualizer domain dispatcher', () => {
  it.each(Object.entries(visualizerRoutes))('%s routes to its dedicated target', (domain, target) => {
    expect(resolveVisualizerRoute(domain)).toBe(target);
    expect(target).not.toBe('structured-state');
  });

  it('sends unclassified state to the explicit variables visualizer', () => {
    expect(resolveVisualizerRoute('unclassified-custom-object')).toBe('variables');
  });
});