const { withAndroidStyles } = require('@expo/config-plugins');

const withAndroidNavFix = (config) => {
  return withAndroidStyles(config, (config) => {
    if (config.modResults.resources.style) {
      config.modResults.resources.style.forEach((style) => {
        if (!style.item) style.item = [];
        
        const themeName = style.$.name || '';
        const isSplashTheme = 
          themeName === 'Theme.App.SplashScreen' ||
          themeName.includes('SplashScreen');
        const isAppTheme = 
          themeName === 'AppTheme' ||
          (themeName.includes('AppTheme') && !isSplashTheme);

        if (isSplashTheme || isAppTheme) {
          // Navigation bar items — apply to ALL themes (splash + app)
          const navItems = [
            { $: { name: 'android:navigationBarColor' }, _: '#000000' },
            { $: { name: 'android:windowDrawsSystemBarBackgrounds' }, _: 'true' },
            { $: { name: 'android:windowTranslucentNavigation' }, _: 'false' },
            { $: { name: 'android:windowLightNavigationBar' }, _: 'false' },
            { $: { name: 'android:navigationBarDividerColor' }, _: '#000000' },
            { $: { name: 'android:enforceNavigationBarContrast' }, _: 'false' },
            { $: { name: 'android:windowOptOutEdgeToEdgeEnforcement' }, _: 'true' },
          ];

          // Window/status bar items — only for AppTheme, NOT splash
          const windowItems = isAppTheme ? [
            { $: { name: 'android:windowBackground' }, _: '#ffffff' },
            { $: { name: 'android:statusBarColor' }, _: '#000000' },
            { $: { name: 'android:windowTranslucentStatus' }, _: 'false' },
            { $: { name: 'android:windowLightStatusBar' }, _: 'false' },
          ] : [];

          const items = [...navItems, ...windowItems];

          items.forEach((newItem) => {
            const existingIndex = style.item.findIndex((i) => i.$.name === newItem.$.name);
            if (existingIndex > -1) {
              style.item[existingIndex] = newItem;
            } else {
              style.item.push(newItem);
            }
          });
        }
      });
    }

    return config;
  });
};

module.exports = withAndroidNavFix;
