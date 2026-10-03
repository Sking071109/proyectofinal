import * as authService from '../services/authService.js';
import { validateCredentials } from '../utils/validation.js';

export async function register(req, res) {
  const credentials = validateCredentials(req.body);
  const result = await authService.register(credentials);
  return res.status(201).json(result);
}

export async function login(req, res) {
  const credentials = validateCredentials(req.body);
  const result = await authService.login(credentials);
  return res.status(200).json(result);
}

export async function me(req, res) {
  const user = await authService.getUserById(req.user.id);
  return res.status(200).json({ user });
}
