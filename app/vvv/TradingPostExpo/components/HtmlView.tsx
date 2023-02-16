import React, { useMemo } from "react"
import { View, Text } from "react-native"
import { HtmlViewProps } from "./HtmlView.interface"
import { WebView as TPWebView } from '@tradingpost/react-native-webview'
import { Gesture, GestureDetector } from "react-native-gesture-handler"
const customCss = '* { -webkit-user-select: none !important;  } input, textarea { -webkit-user-select: initial; } body { user-select: none !important; overflow-x: hidden !important; }';
const customJs = `
(function() {
setTimeout(function() {
try {
  var s = document.createElement('style');
  s.innerHTML = '${customCss.replace(/'/g, "\\'").replace(/(\r\n|\n|\r)/gm, '')}';
  document.head.appendChild(s);
} catch (e) {  }
}, 0); 
})();`;
export const HtmlView = (props: HtmlViewProps) => {


    return <TPWebView
        style={[props.style, { minHeight: 1, opacity: 0.99 }]}
        scrollEnabled={false}
        injectedJavaScript={customJs}
        source={props.isUrl ? { uri: props.children } : { html: props.children }}
        //source={ { html: '<h1 style="font-size:90px">FUCK EXPO</h1>'}}
        allowFileAccess={props.allowFileAccess}
        onNavigationStateChange={props.onNavigationStateChange}
    />
}