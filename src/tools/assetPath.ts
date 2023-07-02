import { isGithubActions } from "@/tools/isGithubActions";
export const assetPath = (assetName : string) => `${isGithubActions ? '/react-playground/' : '/'}${assetName}`