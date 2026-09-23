class TemplateEngine {
  interpolate(templateText, variables) {
    if (!templateText) return '';
    return templateText.replace(/\{\{\s*(.*?)\s*\}\}/g, (match, p1) => {
      const key = p1.trim();
      return variables[key] !== undefined ? variables[key] : match;
    });
  }

  extractVariables(templateText) {
    if (!templateText) return [];
    const matches = [...templateText.matchAll(/\{\{\s*(.*?)\s*\}\}/g)];
    const vars = matches.map(m => m[1].trim());
    return [...new Set(vars)];
  }
}

export default new TemplateEngine();
