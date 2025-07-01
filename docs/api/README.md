# 🔌 API Documentation

This directory contains detailed API reference documentation for all template features that expose APIs or hooks.

## 🎯 Purpose

API documentation provides:

- ✅ **Complete API reference** for all hooks and components
- ✅ **Parameter descriptions** with types and examples
- ✅ **Return value specifications** with TypeScript definitions
- ✅ **Usage examples** for common scenarios

## 📂 API Documentation Structure

| Feature               | API File     | Status     | Description                        |
| --------------------- | ------------ | ---------- | ---------------------------------- |
| 🤖 **Chat**           | `chat.md`    | ✅ Ready   | Chat hooks and components API      |
| 🌓 **Theming**        | `theming.md` | 📋 Planned | Theme and styling utilities        |
| 🔐 **Authentication** | `auth.md`    | 📋 Planned | Authentication hooks and providers |
| 📁 **Storage**        | `storage.md` | 📋 Planned | File storage and management APIs   |

## 🔧 For AI Agents

When creating API documentation:

1. **Document all public APIs** - hooks, components, utilities
2. **Include TypeScript types** for all parameters and returns
3. **Provide working examples** from actual implementation
4. **Cross-reference feature documentation** for context
5. **Follow the API documentation template** (create when needed)

### API Documentation Template

```markdown
# Feature Name API Reference

## Hooks

### `useHookName(params?)`

**Description:** What the hook does

**Parameters:**

- `param1` (Type, required): Description
- `param2` (Type, optional): Description

**Returns:**

- `data` (Type): Description
- `loading` (boolean): Loading state
- `error` (Error | null): Error state

**Example:**
\`\`\`typescript
const { data, loading, error } = useHookName({
param1: 'value'
});
\`\`\`

## Components

### `<ComponentName />`

**Description:** What the component does

**Props:**

- `prop1` (Type, required): Description
- `prop2` (Type, optional): Description

**Example:**
\`\`\`jsx
<ComponentName prop1="value" prop2={true} />
\`\`\`
```

---

_API documentation will be expanded as features are developed and APIs stabilize._
