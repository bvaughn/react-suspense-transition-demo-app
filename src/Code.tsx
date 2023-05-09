import { useMemo } from "react";

import {
  ParsedTokens,
  parsedTokensToHtml,
  syntaxParsingCache,
} from "./suspense/SyntaxParsingCache";

export function Code({
  className = "",
  code,
}: {
  className?: string;
  code: string;
}) {
  const tokens = syntaxParsingCache.read(code);
  return <TokenRenderer className={className} tokens={tokens} />;
}

function TokenRenderer({
  className,
  tokens,
}: {
  className: string;
  tokens: ParsedTokens[];
}) {
  const html = useMemo<string>(() => {
    return tokens
      .map((lineTokens) => parsedTokensToHtml(lineTokens))
      .join("<br/>");
  }, [tokens]);

  return (
    <code className={className} dangerouslySetInnerHTML={{ __html: html }} />
  );
}
