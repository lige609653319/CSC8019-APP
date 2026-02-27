import React from 'react';
import { StyleSheet, SafeAreaView, View, StatusBar } from 'react-native';
import { WebView } from 'react-native-webview';

/**
 * CONFIGURATION:
 * Update this URL to your local dev server IP (e.g., http://192.168.1.5:5173)
 * You can find your IP address by running `ifconfig` (Mac) or `ipconfig` (Windows).
 */
const WEB_APP_URL = 'http://10.90.72.99:5175/';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.content}>
        <WebView
          source={{ uri: WEB_APP_URL }}
          style={styles.webview}
          startInLoadingState={true}
          scalesPageToFit={true}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});
