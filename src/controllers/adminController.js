import { getSummary } from '../services/adminService.js';

export async function summary(req, res) {
  const result = await getSummary();
  return res.status(200).json({ summary: result });
}
