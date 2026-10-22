export function GetPaths(file: string): Set<string> {
    const res = new Set<string>();
    const pattern: RegExp = /^[ \t]*#[ \t]*include[ \t]*"([^"]+)"/gm;
    for (const cur_include of file.matchAll(pattern)) {
        res.add(cur_include[1]);
    }
    return res;
}