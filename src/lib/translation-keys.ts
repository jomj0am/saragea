// lib/translation-keys.ts

// Hii 'object' itahifadhi maelezo ya kila 'key'
export const translationKeyDescriptions: Record<string, string> = {
    // HomePage Namespace
    'HomePage.heroTitle': 'Main title on the homepage. Use <primary> tags for highlighting.',
    'HomePage.heroSubtitle': 'Subtitle text below the main homepage title.',
    'HomePage.propertiesHeader': 'Header for the property list section.',
    'HomePage.searchResultsTitle': 'Title shown when a user searches for properties.',
    'HomePage.noPropertiesFoundTitle': 'Title for the message when no properties are available.',
    'HomePage.noPropertiesFoundSubtitleSearch': 'Message shown when a search returns no results.',
    'HomePage.noPropertiesFoundSubtitleDefault': 'Message shown when there are no properties at all.',

    // Navbar Namespace
    'Navbar.home': 'Text for the "Home" link in the navigation bar.',
    'Navbar.properties': 'Text for the "Properties" link.',
    'Navbar.about': 'Text for the "About Us" link.',
    'Navbar.contact': 'Text for the "Contact" link.',
    
    // Ongeza 'keys' zako zingine hapa
};

// Hii 'function' itatusaidia kubadilisha 'key' kuwa 'label' nzuri
export const formatTranslationKey = (key: string): string => {
    // Ondoa 'namespace' na badilisha 'camelCase' iwe 'Title Case'
    const keyWithoutNamespace = key.substring(key.indexOf('.') + 1);
    const result = keyWithoutNamespace.replace(/([A-Z])/g, ' $1');
    return result.charAt(0).toUpperCase() + result.slice(1);
};