# {Feature Name}

## 🎯 Overview

Brief description of what this feature does and why it's useful for template users.

**Status:** ✅ Ready | 🚧 In Development | 📋 Planned

## ⚡ Quick Start

```bash
# Basic installation/setup commands
EXPO_PUBLIC_ENABLE_{FEATURE}=true
{FEATURE}_API_KEY=your_key_here
```

## 🔧 Configuration

### Environment Variables

| Variable                       | Required | Default   | Description                  |
| ------------------------------ | -------- | --------- | ---------------------------- |
| `EXPO_PUBLIC_ENABLE_{FEATURE}` | ✅       | `false`   | Enable/disable the feature   |
| `{FEATURE}_API_KEY`            | ✅       | -         | API key for external service |
| `EXPO_PUBLIC_{FEATURE}_OPTION` | ❌       | `default` | Optional configuration       |

### Feature Dependencies

```typescript
// Features that must be enabled for this to work
EXPO_PUBLIC_ENABLE_AUTH = true; // Required for user-specific features
```

## ✨ Features

- ✅ Core functionality description
- ✅ Additional feature 1
- ✅ Additional feature 2
- 🚧 Upcoming feature (planned)

## 📝 Usage

### Basic Example

```typescript
import { useFeature } from '@/features/{feature-name}';

export default function MyComponent() {
  const { data, loading, error } = useFeature();

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  return (
    <View>
      {/* Your component JSX */}
    </View>
  );
}
```

### Advanced Configuration

```typescript
// Advanced usage examples
import { FeatureProvider, FeatureConfig } from '@/features/{feature-name}';

const config: FeatureConfig = {
  // Advanced configuration options
};

export default function App() {
  return (
    <FeatureProvider config={config}>
      <YourApp />
    </FeatureProvider>
  );
}
```

## 🎨 Customization

### Styling

```typescript
// How to customize appearance
const customStyles = {
  // Style customization examples
};
```

### Theming

```typescript
// Integration with app theming system
import { useTheme } from '@/features/shared';

const MyFeatureComponent = () => {
  const { colors, theme } = useTheme();
  // Use theme values
};
```

## 🔌 API Reference

### Hooks

#### `useFeature(options?)`

**Parameters:**

- `options` (optional): Configuration object

**Returns:**

- `data`: Feature data
- `loading`: Loading state
- `error`: Error state
- `refetch`: Function to refetch data

#### `useFeatureConfig()`

**Returns:**

- Current feature configuration

### Components

#### `<FeatureComponent />`

**Props:**

- `prop1` (required): Description
- `prop2` (optional): Description

## 🚨 Troubleshooting

### Common Issues

**Issue: Feature not working**

```bash
# Solution steps
1. Check environment variables
2. Verify API keys
3. Restart development server
```

**Issue: Configuration errors**

```bash
# Debug steps
1. Check .env.local file
2. Verify feature dependencies
3. Check console for errors
```

### Error Messages

| Error                 | Cause                   | Solution                                |
| --------------------- | ----------------------- | --------------------------------------- |
| "Feature not enabled" | Feature flag disabled   | Set `EXPO_PUBLIC_ENABLE_{FEATURE}=true` |
| "API key missing"     | Missing API credentials | Add API key to environment              |

## 📚 Related Documentation

- [Setup Guide](../SETUP.md) - Initial project setup
- [Features Overview](../FEATURES.md) - All available features
- [Authentication](./auth/README.md) - If this feature requires auth
- [API Documentation](../api/{feature-name}.md) - API reference

## 🤝 Contributing

To improve this feature:

1. 📖 Read the implementation in [`src/features/{feature-name}/`](../../src/features/{feature-name}/)
2. 🔧 Make your changes
3. 📝 Update this documentation
4. ✅ Test your changes
5. 📤 Submit a pull request

---

**Questions?** Create an issue using the [Setup Help template](../../.github/ISSUE_TEMPLATE/setup_help.md)!
