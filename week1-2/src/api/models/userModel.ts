import {promisePool} from '../../database/db';
import CustomError from '../../classes/CustomError';
import {ResultSetHeader, RowDataPacket} from 'mysql2';
import {GetUser, PostUser, PutUser, User} from '../../interfaces/User';
import {StatusCodes} from 'http-status-codes';

export const getAllUsers = async (): Promise<User[]> => {
  const [rows] = await promisePool.execute<GetUser[]>(
    `
    SELECT user_id, user_name, email, role 
    FROM sssf_user
    `
  );
  if (rows.length === 0) {
    throw new CustomError('No users found', StatusCodes.NOT_FOUND);
  }
  return rows;
};

export const getUser = async (userId: string): Promise<User> => {
  const [rows] = await promisePool.execute<GetUser[]>(
    `
    SELECT user_id, user_name, email, role 
    FROM sssf_user 
    WHERE user_id = ?;
    `,
    [userId]
  );
  if (rows.length === 0) {
    throw new CustomError('No users found', StatusCodes.NOT_FOUND);
  }
  return rows[0];
};

export const addUser = async (data: PostUser) => {
  const sql = promisePool.format('INSERT INTO sssf_user SET ?;', [data]);
  const [headers] = await promisePool.execute<ResultSetHeader>(sql);
  if (headers.affectedRows === 0) {
    throw new CustomError('No user added', StatusCodes.BAD_REQUEST);
  }
  return headers.insertId;
};

export const updateUser = async (data: PutUser, userId: number) => {
  const sql = promisePool.format('UPDATE sssf_user SET ? WHERE user_id = ?;', [
    data,
    userId,
  ]);
  const [headers] = await promisePool.execute<ResultSetHeader>(sql);
  if (headers.affectedRows === 0) {
    throw new CustomError('No users updated', StatusCodes.BAD_REQUEST);
  }
};

export const deleteUser = async (userId: number) => {
  const sql = promisePool.format('DELETE FROM sssf_user WHERE user_id = ?;', [
    userId,
  ]);
  const [headers] = await promisePool.execute<ResultSetHeader>(sql);
  if (headers.affectedRows === 0) {
    throw new CustomError('No user deleted', StatusCodes.BAD_REQUEST);
  }
};

export const getUserLogin = async (username: string): Promise<User> => {
  const [rows] = await promisePool.execute<GetUser[]>(
    `
    SELECT * FROM sssf_user 
    WHERE user_name = ?;
    `,
    [username]
  );
  if (rows.length === 0) {
    throw new CustomError('Invalid username/password', StatusCodes.BAD_REQUEST);
  }
  return rows[0];
};

export const userNameExists = async (userName: string): Promise<boolean> => {
  const [rows] = await promisePool.execute<GetUser[]>(
    `
    SELECT * FROM sssf_user 
    WHERE user_name = ?;
    `,
    [userName]
  );
  return rows.length > 0;
};

export const emailExists = async (email: string): Promise<boolean> => {
  const [rows] = await promisePool.execute<GetUser[]>(
    `
    SELECT * FROM sssf_user 
    WHERE email = ?;
    `,
    [email]
  );
  return rows.length > 0;
};
