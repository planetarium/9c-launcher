import { JSCodeshift, JSXElement, Transform } from "jscodeshift";
import pages from "./src/renderer/i18n/pages.json";

export const parser = "tsx";

function identity<T>(v: T) {
  return v;
}

function createT(j: JSCodeshift, value: string, key: string) {
  const strWrap = value.includes('"') ? j.jsxExpressionContainer : identity

  return j.jsxElement(
    j.jsxOpeningElement(
      j.jsxIdentifier("T"),
      [
        j.jsxAttribute(j.jsxIdentifier("_str"), strWrap(j.stringLiteral(value))),
        j.jsxAttribute(j.jsxIdentifier("_tags"), j.stringLiteral(key)),
      ],
      true
    )
  );
}

const transform: Transform = (file, api) => {
  const j = api.jscodeshift;
  const ast = j(file.source);

  const keyPath = ast
    .find(j.CallExpression)
    .filter(
      ({ node }) =>
        node.callee.type === "Identifier" &&
        node.callee.name === "useLocale" &&
        node.arguments.length === 1 &&
        node.arguments[0].type === "StringLiteral"
    );

  if (keyPath.length === 0) return file.source;
  const keyExpr = keyPath.nodes()[0].arguments[0];

  if (keyExpr.type !== "StringLiteral") return file.source;

  const key = keyExpr.value;
  keyPath.map((path) => path.parentPath).remove();

  ast
    .find(j.ImportDeclaration)
    .filter(
      ({ node }) =>
        typeof node.specifiers === "object" &&
        node.specifiers.length > 0 &&
        node.specifiers[0].type === "ImportSpecifier" &&
        node.specifiers[0].imported.type === "Identifier" &&
        node.specifiers[0].imported.name === "useLocale"
    )
    .replaceWith(j.template.statement`import { T } from '@transifex/react';`);

  ast
    .find(j.JSXExpressionContainer)
    .filter(
      ({ node }) =>
        node.expression.type === "CallExpression" &&
        node.expression.callee.type === "Identifier" &&
        node.expression.callee.name === "locale" &&
        node.expression.arguments.length === 1 &&
        node.expression.arguments[0].type === "StringLiteral"
    )
    .replaceWith(({ node, parent }) => {
      if (node.expression.type !== "CallExpression") return null;
      function wrap(path: JSXElement) {
        return parent.value.type === "JSXAttribute" ? j.jsxExpressionContainer(path) : path;
      }
      const value =
        node.expression.arguments[0].type === "StringLiteral" &&
        node.expression.arguments[0].value;
      if (!value) return null;
      return wrap(createT(j, (pages as any)[key][value].en, key));
    });

  return ast.toSource();
};

export default transform;
