import { Problem, Attempt, CreateSubmissionPayload } from '../types';

const rawBase = import.meta.env.VITE_API_BASE_URL || '/api';
const API_BASE = rawBase.replace(/\/+$/, '');

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Request failed with status ${response.status}`);
  }
  return response.json();
}

export const api = {
  async getProblems(): Promise<Problem[]> {
    const res = await fetch(`${API_BASE}/problems`);
    return handleResponse<Problem[]>(res);
  },

  async getProblemBySlug(slug: string): Promise<Problem> {
    const res = await fetch(`${API_BASE}/problems/${slug}`);
    return handleResponse<Problem>(res);
  },

  async createAttempt(slug: string): Promise<Attempt> {
    const res = await fetch(`${API_BASE}/problems/${slug}/attempts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse<Attempt>(res);
  },

  async getAttempt(id: string): Promise<Attempt> {
    const res = await fetch(`${API_BASE}/attempts/${id}`);
    return handleResponse<Attempt>(res);
  },

  async getAttemptsByProblem(slug: string): Promise<Attempt[]> {
    const res = await fetch(`${API_BASE}/problems/${slug}/attempts`);
    return handleResponse<Attempt[]>(res);
  },

  async submitSolution(id: string, payload: CreateSubmissionPayload): Promise<Attempt> {
    const res = await fetch(`${API_BASE}/attempts/${id}/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<Attempt>(res);
  },
};
