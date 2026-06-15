import { useEffect, useState, type ReactNode } from "react";
import axios from "axios";
import { UserContext, type UserType } from "../contexts/userContext.js"; // Import context dari file sebelah

interface Props {
    children: ReactNode;
}

export function UserProvider({ children }: Props) {
    const [users, setUsers] = useState<UserType[]>([]);
    const [role, setRole] = useState("Randi");
    const [loading, setLoading] = useState<boolean>(true);

    function roleSet (role) {
        setRole(role);
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:3100/api/users');
                
                if (response.data && response.data.data) {
                    setUsers(response.data.data);
                } else {
                    setUsers(response.data);
                }
            } catch (error) {
                console.error("Gagal mengambil data user:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        // PERBAIKAN: Gunakan UserContext.Provider asli, bukan ThemeContext
        <UserContext.Provider value={{ users, loading, role, setRole }}>
            {children}
        </UserContext.Provider>
    );
}