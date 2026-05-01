import { describe, it, expect } from 'vitest';

// Example logic function (could be imported from a utility file)
const calculateTotal = (items) => {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0);
};

describe('Cart Logic', () => {
  it('should calculate the total price correctly', () => {
    const items = [
      { price: 10, quantity: 2 },
      { price: 5, quantity: 1 }
    ];
    expect(calculateTotal(items)).toBe(25);
  });

  it('should return 0 for an empty cart', () => {
    expect(calculateTotal([])).toBe(0);
  });
});
