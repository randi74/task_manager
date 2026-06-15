import { createContext } from "react";

export interface UserType {
    id: number;
    username: string;
}

// Karena ini berisi daftar banyak user (array), beri tipe data UserType[]
export interface UserContextType {
    users: UserType[];
    loading: boolean;
    role: string,
    setRole: (role: string) => void
}

export const UserContext = createContext<UserContextType>({});