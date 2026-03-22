import { describe, it, expect } from 'vitest';
import { createHandle } from '../../domain/models/parts/Handle';
import { createGear } from '../../domain/models/parts/Gear';
import { createLever } from '../../domain/models/parts/Lever';
import { createCam } from '../../domain/models/parts/Cam';
import { createSlider } from '../../domain/models/parts/Slider';
import { createFlag } from '../../domain/models/parts/Flag';
import { createBell } from '../../domain/models/parts/Bell';

// --------------------------------------------------------------------------
// Handle
// --------------------------------------------------------------------------

describe('createHandle', () => {
  it('type が handle', () => {
    expect(createHandle().type).toBe('handle');
  });

  it('rotary output ポートを1つ持つ', () => {
    const h = createHandle();
    expect(h.ports).toHaveLength(1);
    expect(h.ports[0].kind).toBe('rotary');
    expect(h.ports[0].role).toBe('output');
  });

  it('ID が指定値で作れる', () => {
    const h = createHandle({}, { x: 0, y: 0 }, 'my-handle');
    expect(h.id).toBe('my-handle');
    expect(h.ports[0].id).toBe('my-handle-out');
  });

  it('デフォルト rpm が 60', () => {
    expect(createHandle().params.rpm).toBe(60);
  });

  it('params を上書きできる', () => {
    expect(createHandle({ rpm: 120 }).params.rpm).toBe(120);
  });
});

// --------------------------------------------------------------------------
// Gear
// --------------------------------------------------------------------------

describe('createGear', () => {
  it('type が gear', () => {
    expect(createGear().type).toBe('gear');
  });

  it('rotary input + rotary output ポートを持つ', () => {
    const g = createGear();
    expect(g.ports).toHaveLength(2);
    expect(g.ports[0].kind).toBe('rotary');
    expect(g.ports[0].role).toBe('input');
    expect(g.ports[1].kind).toBe('rotary');
    expect(g.ports[1].role).toBe('output');
  });

  it('デフォルト teeth が 12', () => {
    expect(createGear().params.teeth).toBe(12);
  });

  it('半径に応じてポートオフセットが変わる', () => {
    const g = createGear({ radius: 30 });
    expect(g.ports[0].offset.x).toBe(-30);
    expect(g.ports[1].offset.x).toBe(30);
  });
});

// --------------------------------------------------------------------------
// Lever
// --------------------------------------------------------------------------

describe('createLever', () => {
  it('type が lever', () => {
    expect(createLever().type).toBe('lever');
  });

  it('linear input + linear output ポートを持つ', () => {
    const l = createLever();
    expect(l.ports[0].kind).toBe('linear');
    expect(l.ports[0].role).toBe('input');
    expect(l.ports[1].kind).toBe('linear');
    expect(l.ports[1].role).toBe('output');
  });

  it('デフォルト pivotRatio が 0.5', () => {
    expect(createLever().params.pivotRatio).toBe(0.5);
  });
});

// --------------------------------------------------------------------------
// Cam
// --------------------------------------------------------------------------

describe('createCam', () => {
  it('type が cam', () => {
    expect(createCam().type).toBe('cam');
  });

  it('rotary input + linear output ポートを持つ', () => {
    const c = createCam();
    expect(c.ports[0].kind).toBe('rotary');
    expect(c.ports[0].role).toBe('input');
    expect(c.ports[1].kind).toBe('linear');
    expect(c.ports[1].role).toBe('output');
  });

  it('出力ポートのオフセット Y = radius + eccentricity', () => {
    const c = createCam({ radius: 20, eccentricity: 16 });
    expect(c.ports[1].offset.y).toBe(36);
  });
});

// --------------------------------------------------------------------------
// Slider
// --------------------------------------------------------------------------

describe('createSlider', () => {
  it('type が slider', () => {
    expect(createSlider().type).toBe('slider');
  });

  it('linear input + trigger output ポートを持つ', () => {
    const s = createSlider();
    expect(s.ports[0].kind).toBe('linear');
    expect(s.ports[0].role).toBe('input');
    expect(s.ports[1].kind).toBe('trigger');
    expect(s.ports[1].role).toBe('output');
  });
});

// --------------------------------------------------------------------------
// Flag
// --------------------------------------------------------------------------

describe('createFlag', () => {
  it('type が flag', () => {
    expect(createFlag().type).toBe('flag');
  });

  it('trigger input ポートを1つ持つ', () => {
    const f = createFlag();
    expect(f.ports).toHaveLength(1);
    expect(f.ports[0].kind).toBe('trigger');
    expect(f.ports[0].role).toBe('input');
  });

  it('デフォルト waveAmplitude が 8', () => {
    expect(createFlag().params.waveAmplitude).toBe(8);
  });
});

// --------------------------------------------------------------------------
// Bell
// --------------------------------------------------------------------------

describe('createBell', () => {
  it('type が bell', () => {
    expect(createBell().type).toBe('bell');
  });

  it('trigger input ポートを1つ持つ', () => {
    const b = createBell();
    expect(b.ports).toHaveLength(1);
    expect(b.ports[0].kind).toBe('trigger');
    expect(b.ports[0].role).toBe('input');
  });

  it('デフォルト resonance が 3', () => {
    expect(createBell().params.resonance).toBe(3);
  });
});

// --------------------------------------------------------------------------
// 全部品: 基本構造の不変条件
// --------------------------------------------------------------------------

describe('全部品: 基本構造の不変条件', () => {
  const factories = [
    createHandle,
    createGear,
    createLever,
    createCam,
    createSlider,
    createFlag,
    createBell,
  ];

  it.each(factories)('各部品に id・type・position・params・ports が存在する', (factory) => {
    const part = factory();
    expect(part).toHaveProperty('id');
    expect(part).toHaveProperty('type');
    expect(part).toHaveProperty('position');
    expect(part).toHaveProperty('params');
    expect(part).toHaveProperty('ports');
  });

  it.each(factories)('位置を指定できる', (factory) => {
    const part = factory({}, { x: 50, y: 100 });
    expect(part.position).toEqual({ x: 50, y: 100 });
  });

  it.each(factories)('ID を明示指定できる', (factory) => {
    const part = factory({}, { x: 0, y: 0 }, 'fixed-id');
    expect(part.id).toBe('fixed-id');
  });

  it.each(factories)('各ポートに id・kind・role・offset が存在する', (factory) => {
    const part = factory();
    for (const port of part.ports) {
      expect(port).toHaveProperty('id');
      expect(port).toHaveProperty('kind');
      expect(port).toHaveProperty('role');
      expect(port).toHaveProperty('offset');
    }
  });
});
