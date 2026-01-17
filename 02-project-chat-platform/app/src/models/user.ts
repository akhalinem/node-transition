import dbClient from "../config/database";

interface User {
  id: string;
  email: string;
  username: string;
  display_name: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
  refresh_token?: string | null;
}

const findUserById = async (id: string): Promise<User | null> => {
  const result = await dbClient.query<User>(
    "SELECT * FROM users WHERE id = $1",
    [id]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
};

const findUserByEmail = async (email: string): Promise<User | null> => {
  const result = await dbClient.query<User>(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
};

const createUser = async (
  userData: Omit<User, "id" | "created_at" | "updated_at">
): Promise<User> => {
  const result = await dbClient.query<User>(
    `INSERT INTO users (email, username, display_name, password_hash)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [
      userData.email,
      userData.username,
      userData.display_name,
      userData.password_hash,
    ]
  );

  return result.rows[0];
};

export { User, findUserById, findUserByEmail, createUser };
