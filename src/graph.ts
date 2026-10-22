import {GetPaths} from './parser'
import {GetAbsolutePath} from './resolve-absolute-path'

export interface GraphOfDependencies {
    include: Map<string, Set<string>>;
    included_by: Map<string, Set<string>>;
}

export function BuildGraph(data: Map<string, string>, root: string): GraphOfDependencies {
    const res: GraphOfDependencies = {
        include: new Map<string, Set<string>>(),
        included_by: new Map<string, Set<string>>()
    };

    const all_files = new Set(data.keys());

    for (const file of all_files) {
        res.include.set(file, new Set<string>());
        res.included_by.set(file, new Set<string>());
    }

    for (const [key, text] of data) {
        const cur_include_set = res.include.get(key);

        const includes: Set<string> = GetPaths(text);

        for (const include_path of includes) {
            const cur_file_absolute_path = GetAbsolutePath(all_files, include_path, key, root);

            if (cur_file_absolute_path !== undefined) {
                cur_include_set?.add(cur_file_absolute_path);

                const cur_included_by_set = res.included_by.get(cur_file_absolute_path);

                cur_included_by_set?.add(key);
            }
        }
    }
    return res;
}