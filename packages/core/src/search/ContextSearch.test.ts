import { ContextSearch } from './ContextSearch';
import { ContextEntry, ContextSource, ContextType, StorageAdapter } from '../types';

const entries: ContextEntry[] = [
  {
    id: 'first', timestamp: new Date('2026-01-01T00:00:00Z'), type: ContextType.TEXT,
    content: 'database schema alpha', metadata: {}, fileAssociations: [], tags: ['db'], source: ContextSource.MANUAL
  },
  {
    id: 'second', timestamp: new Date('2026-01-02T00:00:00Z'), type: ContextType.TEXT,
    content: 'database schema beta', metadata: {}, fileAssociations: [], tags: ['db'], source: ContextSource.MANUAL
  },
  {
    id: 'third', timestamp: new Date('2026-01-03T00:00:00Z'), type: ContextType.TEXT,
    content: 'database schema gamma', metadata: {}, fileAssociations: [], tags: ['db'], source: ContextSource.MANUAL
  }
];

const createStorage = (): StorageAdapter => ({
  initialize: async () => undefined,
  saveContext: async () => '',
  getContext: async (id) => entries.find((entry) => entry.id === id) ?? null,
  getContextsByFile: async () => [],
  getContextsByCommit: async () => [],
  getContextsByDateRange: async () => [],
  searchContexts: async () => [],
  deleteContext: async () => false,
  updateContext: async () => false,
  getAllContexts: async () => entries
});

describe('ContextSearch pagination', () => {
  it('applies offset and limit to the filtered search results', async () => {
    const search = new ContextSearch(createStorage());
    const all = await search.search('database');
    const page = await search.search('database', { offset: 1, limit: 1 });

    expect(all).toHaveLength(3);
    expect(page).toEqual([all[1]]);
  });

  it('respects a zero limit and clamps negative offsets', async () => {
    const search = new ContextSearch(createStorage());

    expect(await search.search('database', { limit: 0 })).toEqual([]);
    expect(await search.search('database', { offset: -5, limit: 1 })).toHaveLength(1);
  });
});
