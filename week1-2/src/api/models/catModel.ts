import {promisePool} from '../../database/db';
import CustomError from '../../classes/CustomError';
import {ResultSetHeader} from 'mysql2';
import {Cat, GetCat, PostCat, PutCat} from '../../interfaces/Cat';
import {StatusCodes} from 'http-status-codes';

const getAllCats = async (): Promise<Cat[]> => {
  const [rows] = await promisePool.execute<GetCat[]>(
    `
    SELECT cat_id, cat_name, weight, filename, birthdate, ST_X(coords) as lat, ST_Y(coords) as lng,
    JSON_OBJECT('user_id', sssf_user.user_id, 'user_name', sssf_user.user_name) AS owner 
	  FROM sssf_cat 
	  JOIN sssf_user 
    ON sssf_cat.owner = sssf_user.user_id
    `
  );
  if (rows.length === 0) {
    throw new CustomError('No cats found', 404);
  }
  // const cats: Cat[] = rows.map((row) => ({
  //   ...row,
  //   owner: JSON.parse(row.owner?.toString() || '{}'),
  // }));

  return rows as Cat[];
};

const getCat = async (id: number | string) => {
  const [rows] = await promisePool.execute<GetCat[]>(
    `
    SELECT cat_id, cat_name, weight, filename, birthdate, ST_X(coords) as lat, ST_Y(coords) as lng,
    JSON_OBJECT('user_id', sssf_user.user_id, 'user_name', sssf_user.user_name) AS owner 
	  FROM sssf_cat 
	  JOIN sssf_user 
    ON sssf_cat.owner = sssf_user.user_id
    WHERE cat_id = ?
    `,
    [id]
  );
  if (rows.length === 0) {
    throw new CustomError('No cat found', StatusCodes.NOT_FOUND);
  }

  return rows[0] as Cat;
};

const addCat = async (data: PostCat): Promise<number> => {
  const ownerId =
    typeof data.owner === 'number' ? data.owner : data.owner.user_id;
  const [headers] = await promisePool.execute<ResultSetHeader>(
    `
    INSERT INTO sssf_cat (cat_name, weight, owner, filename, birthdate, coords) 
    VALUES (?, ?, ?, ?, ?, POINT(?, ?))
    `,
    [
      data.cat_name,
      data.weight,
      ownerId,
      data.filename,
      data.birthdate,
      data.lat,
      data.lng,
    ]
  );
  if (headers.affectedRows === 0) {
    throw new CustomError('No cats added', StatusCodes.BAD_REQUEST);
  }
  return headers.insertId;
};

const updateCat = async (cat: PutCat, id: number) => {
  const originalCat = await getCatWithoutUser(id);
  const data = mergeCats(cat, originalCat);
  const owner = getOwnerId(cat, originalCat);
  const dt = new Date(data.birthdate);
  const birthdate = dt.toISOString().slice(0, 10);
  const sql = promisePool.format(
    `
    UPDATE sssf_cat SET ?, coords = POINT(?, ?) WHERE cat_id = ?;
    `,
    [
      {
        cat_name: data.cat_name,
        weight: data.weight,
        owner,
        filename: data.filename,
        birthdate,
      },
      data.lat,
      data.lng,
      id,
    ]
  );
  const [headers] = await promisePool.execute<ResultSetHeader>(sql);
  if (!headers.affectedRows) {
    throw new CustomError('No cat updated', StatusCodes.BAD_REQUEST);
  }
};

async function getCatWithoutUser(id: number) {
  const [rows] = await promisePool.execute<GetCat[]>(
    `
    SELECT cat_id, cat_name, weight, filename, birthdate, owner, ST_X(coords) as lat, ST_Y(coords) as lng
    FROM sssf_cat 
    WHERE cat_id = ?
    `,
    [id]
  );
  if (rows.length === 0) {
    throw new CustomError('No cat found', StatusCodes.NOT_FOUND);
  }

  return rows[0] as Cat;
}

export async function userOwnsCat(catId: number, userId: number) {
  const [rows] = await promisePool.execute<GetCat[]>(
    `
    SELECT * FROM sssf_cat WHERE cat_id = ? AND owner = ?;
    `,
    [catId, userId]
  );
  return rows.length > 0;
}

function getOwnerId(cat: PutCat, orig: Cat) {
  if (cat.owner) {
    if (typeof cat.owner === 'number') {
      return cat.owner;
    }
    return cat.owner.user_id;
  }
  return typeof orig.owner === 'number' ? orig.owner : orig.owner.user_id;
}

function mergeCats(target: PutCat, orig: Cat) {
  return {
    ...orig,
    ...target,
  } as Cat;
}

const deleteCat = async (catId: number): Promise<number> => {
  const [headers] = await promisePool.execute<ResultSetHeader>(
    `
    DELETE FROM sssf_cat 
    WHERE cat_id = ?;
    `,
    [catId]
  );
  if (headers.affectedRows === 0) {
    throw new CustomError('No cats deleted', 400);
  }
  return headers.insertId;
};

export {getAllCats, getCat, addCat, updateCat, deleteCat};
