/* eslint-disable import/first -- mocks must be defined before imports */
let mockRoute: any = { name: 'CreateUser', params: undefined };
const mockCreateUser = jest.fn();
const mockGetUserById = jest.fn();
const mockUpdateUser = jest.fn();
const mockDeleteUser = jest.fn();
const mockCreateLocalId = jest.fn(() => 'local_1');
let latestUpsertDeps: any;

jest.mock('@react-navigation/native', () => ({
  useRoute: () => mockRoute,
}));

jest.mock('@/src/database/sqlite/usersRepo', () => ({
  createUser: (...args: any[]) => mockCreateUser(...args),
  getUserById: (...args: any[]) => mockGetUserById(...args),
  updateUser: (...args: any[]) => mockUpdateUser(...args),
  deleteUser: (...args: any[]) => mockDeleteUser(...args),
}));

jest.mock('@/src/utils/id', () => ({
  createLocalId: () => mockCreateLocalId(),
}));

jest.mock('@/src/screens/UpsertUserScreenBase', () => ({
  __esModule: true,
  default: ({ deps }: any) => {
    latestUpsertDeps = deps;
    return null;
  },
}));

import { renderWithProviders } from '@/src/test/renderWithProviders';

import CreateUserScreen from './CreateUserScreen';

describe('CreateUserScreen route wrapper', () => {
  beforeEach(() => {
    mockRoute = { name: 'CreateUser', params: undefined };
    mockCreateUser.mockReset();
    mockGetUserById.mockReset();
    mockUpdateUser.mockReset();
    mockDeleteUser.mockReset();
    mockCreateLocalId.mockReset();
    mockCreateLocalId.mockReturnValue('local_1');
    latestUpsertDeps = undefined;
  });

  it('uses create mode for CreateUser route', async () => {
    const navigation = { goBack: jest.fn() } as any;
    renderWithProviders(<CreateUserScreen navigation={navigation} />);

    expect(latestUpsertDeps.mode).toBe('create');

    await latestUpsertDeps.onCreate({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      role: 'ADMIN',
    });

    expect(mockCreateLocalId).toHaveBeenCalled();
    expect(mockCreateUser).toHaveBeenCalledWith({
      id: 'local_1',
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      role: 'ADMIN',
    });

    latestUpsertDeps.onDone();
    expect(navigation.goBack).toHaveBeenCalled();
  });

  it('uses edit mode for EditUser route and wires repo helpers', async () => {
    mockRoute = { name: 'EditUser', params: { id: 'user_1' } };
    mockGetUserById.mockResolvedValue({
      id: 'user_1',
      name: 'Ada',
      email: null,
      role: 'ADMIN',
      updated_at: 1,
    });

    const navigation = { goBack: jest.fn() } as any;
    renderWithProviders(<CreateUserScreen navigation={navigation} />);

    expect(latestUpsertDeps.mode).toBe('edit');

    await latestUpsertDeps.getInitial();
    expect(mockGetUserById).toHaveBeenCalledWith('user_1');

    await latestUpsertDeps.onUpdate({
      name: 'Ada Lovelace',
      email: null,
      role: 'ADMIN',
    });
    expect(mockUpdateUser).toHaveBeenCalledWith({
      id: 'user_1',
      name: 'Ada Lovelace',
      email: null,
      role: 'ADMIN',
    });

    await latestUpsertDeps.onDelete();
    expect(mockDeleteUser).toHaveBeenCalledWith('user_1');

    latestUpsertDeps.onDone();
    expect(navigation.goBack).toHaveBeenCalled();
  });
});

