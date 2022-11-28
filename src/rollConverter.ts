/** @format */

import { Parser } from '@dice-roller/rpg-dice-roller';

export function convertOperators(equation: string) {
  const operator = {};
  const keep = equation.match(/k(l|h)?(\d+)?/);
  if (keep) {
    if (keep.length > 0) {
      if (keep.length == 3) {
        operator['k'] = `${keep[1]}${keep[2]}`;
      } else if (keep.length == 2) {
        operator['k'] = `${keep[1]}1`;
      } else if (keep.length == 1) {
        if (operator === 'k') {
          operator['k'] = 'h1';
        }
      }
    }
    return operator;
  }
}

export function convertEquation(equation: string, theme: string) {
  const dice = [];

  const parsedEquation = Parser.parse(equation);

  // build the roll object
  let sign = 1;
  parsedEquation.forEach(term => {
    if (term.sides && term.qty) {
      for (let i = 0; i < term.qty; i++) {
        if (term.sides === 100) {
          dice.push({
            theme,
            type: `d10x`,
          });
          dice.push({
            theme,
            type: `d10`,
          });
        } else {
          dice.push({
            theme,
            type: `d${term.sides}`,
          });
        }
      }
    } else if (term === '+') {
      sign = 1;
    } else if (term === '-') {
      sign = -1;
    } else {
      dice.push({
        theme,
        type: 'mod',
        value: sign * parseInt(term),
      });
    }
  });
  return dice;
}
