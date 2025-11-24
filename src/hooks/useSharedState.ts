// このファイルは後方互換性のために残しますが、
// 新しい実装では useSharedStateContext を直接使用することを推奨します
import { useSharedStateContext } from "@/contexts/SharedStateContext";

/**
 * @deprecated SharedStateContextを直接使用することを推奨します
 * import { useSharedStateContext } from "@/web/contexts/SharedStateContext";
 */
export function useSharedState() {
    console.warn("useSharedState is deprecated. Use useSharedStateContext instead.");
    return useSharedStateContext();
}