import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

type QueryUpdateValue = string | number | boolean | null | undefined;
type QueryUpdates = Record<string, QueryUpdateValue>;

type UseListUrlFiltersOptions = {
    defaultPage?: number;
    defaultLimit?: number;
};

const normalizeParamValue = (value: QueryUpdateValue): string | undefined => {
    if (value === undefined || value === null || value === "") {
        return undefined;
    }
    return String(value);
};

const parsePositiveInt = (value: string | null, fallback: number): number => {
    const parsed = Number.parseInt(value ?? "", 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const useListUrlFilters = (
    options: UseListUrlFiltersOptions = {},
) => {
    const { defaultPage = 1, defaultLimit = 20 } = options;
    const [searchParams, setSearchParams] = useSearchParams();

    const updateFilters = useCallback(
        (updates: QueryUpdates) => {
            setSearchParams((prev) => {
                const next = new URLSearchParams(prev);

                Object.entries(updates).forEach(([key, value]) => {
                    const normalized = normalizeParamValue(value);
                    if (normalized === undefined) {
                        next.delete(key);
                    } else {
                        next.set(key, normalized);
                    }
                });

                return next;
            });
        },
        [setSearchParams],
    );

    const page = useMemo(
        () => parsePositiveInt(searchParams.get("page"), defaultPage),
        [searchParams, defaultPage],
    );

    const limit = useMemo(
        () => parsePositiveInt(searchParams.get("limit"), defaultLimit),
        [searchParams, defaultLimit],
    );

    const readString = useCallback(
        (key: string) => searchParams.get(key) || "",
        [searchParams],
    );

    const readOptionalString = useCallback(
        (key: string) => searchParams.get(key) || undefined,
        [searchParams],
    );

    return {
        searchParams,
        page,
        limit,
        updateFilters,
        readString,
        readOptionalString,
    };
};
