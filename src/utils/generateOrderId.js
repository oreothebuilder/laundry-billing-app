/**
 * Order ID Generator
 * Generates sequential order numbers in the format:
 * A001, A002 ... A998, A999, B001, B002 ... Z999
 * Rolls over from Z999 back to A001 if sequence completes.
 */

/**
 * Converts an Order ID (e.g. "A001" or "B042") to its 0-indexed sequence integer.
 * Returns -1 if the format does not match.
 */
export function orderIdToSeq(orderId) {
  if (!orderId || typeof orderId !== 'string') return -1;
  const match = orderId.trim().toUpperCase().match(/^([A-Z])(\d{3})$/);
  if (!match) return -1;
  const letterIndex = match[1].charCodeAt(0) - 65; // 'A' -> 0, 'Z' -> 25
  const num = parseInt(match[2], 10);
  if (num < 1 || num > 999) return -1;
  return letterIndex * 999 + (num - 1);
}

/**
 * Converts a 0-indexed sequence integer to an Order ID string (e.g. 0 -> "A001", 998 -> "A999", 999 -> "B001").
 */
export function seqToOrderId(seqIndex) {
  const normalized = Math.max(0, Number(seqIndex) || 0) % (26 * 999);
  const letterCode = Math.floor(normalized / 999);
  const letter = String.fromCharCode(65 + letterCode);
  const num = (normalized % 999) + 1;
  return `${letter}${String(num).padStart(3, '0')}`;
}

/**
 * Generates the next sequential order ID.
 * Accepts either:
 * - existingOrders (Array of order objects containing .orderId or .id)
 * - existingCount (Number)
 */
export function generateOrderId(existingOrdersOrCount = []) {
  let existingOrders = [];

  if (Array.isArray(existingOrdersOrCount)) {
    existingOrders = existingOrdersOrCount;
  } else if (typeof existingOrdersOrCount === 'number') {
    return seqToOrderId(existingOrdersOrCount);
  } else {
    try {
      const data = localStorage.getItem('laundry_app_orders_v1');
      if (data) existingOrders = JSON.parse(data);
    } catch (_) {}
  }

  let maxSeq = -1;
  const existingIdSet = new Set();

  for (const o of existingOrders) {
    const id = o?.orderId || o?.id;
    if (id) {
      const upperId = String(id).trim().toUpperCase();
      existingIdSet.add(upperId);
      const seq = orderIdToSeq(upperId);
      if (seq > maxSeq) {
        maxSeq = seq;
      }
    }
  }

  let nextSeq = maxSeq + 1;
  while (existingIdSet.has(seqToOrderId(nextSeq))) {
    nextSeq++;
  }

  return seqToOrderId(nextSeq);
}
