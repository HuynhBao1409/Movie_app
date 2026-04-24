//fetchMovies
//fetchMoviesDetails

import { useEffect, useState } from "react";


//useFetch(fetchMovies)


const useFetch = <T>(fetchFunction: () => Promise<T>, autoFetch = true) => {
    // State quản lý dữ liệu, loading, lỗi
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    // Hàm call API
    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null)

            const result = await fetchFunction();
            setData(result);
            return result;
        } catch (err) {
            //@ts-ignore
            setError(err instanceof Error ? err : new Error('An error occurred'));
            return undefined;
        } finally {
            setLoading(false);
        }
    }

    // Reset tất cả state
    const reset = () => {
        setData(null);
        setLoading(false);
        setError(null);
    }

    // Tự động fetch khi component mount nếu autoFetch=true
    useEffect(() => {
        if (autoFetch) {
            fetchData();
        }
    }, []);

    return { data, loading, error, refetch: fetchData, reset };
}

export default useFetch;