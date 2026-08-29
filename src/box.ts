import { BoxOptions } from './types';
import { Colorizer } from './utils';

const BORDER_STYLES = {
  single: {
    tl: '┌',
    tr: '┐',
    bl: '└',
    br: '┘',
    h: '─',
    v: '│'
  },
  double: {
    tl: '╔',
    tr: '╗',
    bl: '╚',
    br: '╝',
    h: '═',
    v: '║'
  },
  rounded: {
    tl: '╭',
    tr: '╮',
    bl: '╰',
    br: '╯',
    h: '─',
    v: '│'
  },
  bold: {
    tl: '┏',
    tr: '┓',
    bl: '┗',
    br: '┛',
    h: '━',
    v: '┃'
  }
};

export class BoxDrawer {
  static draw(text: string, options: BoxOptions = {}): string {
    const style = BORDER_STYLES[options.borderStyle || 'rounded'] || BORDER_STYLES.rounded;
    const padding = options.padding ?? 1;
    const color = options.borderColor || 'cyan';

    const lines = text.split('\n');
    let maxContentWidth = 0;

    for (const line of lines) {
      const cleanLen = Colorizer.stripAnsi(line).length;
      if (cleanLen > maxContentWidth) {
        maxContentWidth = cleanLen;
      }
    }

    if (options.title) {
      const titleLen = Colorizer.stripAnsi(options.title).length + 2;
      if (titleLen > maxContentWidth) {
        maxContentWidth = titleLen;
      }
    }

    const innerWidth = maxContentWidth + padding * 2;
    const padStr = ' '.repeat(padding);

    // Build top border with optional title
    let topBorder = '';
    if (options.title) {
      const cleanTitle = Colorizer.stripAnsi(options.title);
      const titleDisplay = ` ${options.title} `;
      const remainingH = Math.max(0, innerWidth - cleanTitle.length - 2);
      const leftH = style.h.repeat(2);
      const rightH = style.h.repeat(Math.max(0, remainingH - 2));
      topBorder = `${style.tl}${leftH}${titleDisplay}${rightH}${style.tr}`;
    } else {
      topBorder = `${style.tl}${style.h.repeat(innerWidth)}${style.tr}`;
    }

    const coloredTop = Colorizer.applyColor(topBorder, color);
    const bottomBorder = Colorizer.applyColor(
      `${style.bl}${style.h.repeat(innerWidth)}${style.br}`,
      color
    );
    const vert = Colorizer.applyColor(style.v, color);

    const resultLines: string[] = [coloredTop];

    // Top padding lines
    for (let p = 0; p < padding - 1; p++) {
      resultLines.push(`${vert}${' '.repeat(innerWidth)}${vert}`);
    }

    // Content lines
    for (const line of lines) {
      const cleanLen = Colorizer.stripAnsi(line).length;
      const rightPad = ' '.repeat(maxContentWidth - cleanLen);
      resultLines.push(`${vert}${padStr}${line}${rightPad}${padStr}${vert}`);
    }

    // Bottom padding lines
    for (let p = 0; p < padding - 1; p++) {
      resultLines.push(`${vert}${' '.repeat(innerWidth)}${vert}`);
    }

    resultLines.push(bottomBorder);

    return resultLines.join('\n');
  }
}
