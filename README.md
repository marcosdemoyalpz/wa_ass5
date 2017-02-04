# Advanced Web Programming
Today's Agenda (2/2/2017)

## Let's play around with our API
### First let's install our dependencies.
1. Install [Java JDK](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html).
2. Install [Android SDK](https://dl.google.com/android/repository/tools_r25.2.3-windows.zip).
3. Add these environment variables
  * `JAVA_HOME`: The path to where Java is installed.
  * `PATH`: Two entries, one where Tools are installed for the Android SDK, and another for Platform tools.
4. Run Android tools by executing the `android` command.
  * Android Platform SDK for your targeted version of Android
  * Android Platform-Tools
  * Android SDK build-tools version 19.1.0 or higher (ideally 23.0.3)
  * Android Support Repository (found under "Extras")
5. Let's install [Genymotion](https://www.genymotion.com/)
  * There's a direct dependency on VBOX so heads up.
6. Install Ionic
     
     npm install -g cordova ionic

7. Create a new Ionic 2 project tabbed project.

    ionic start --v2 myApp tabs
    
8. Run your app

    cd myApp
    ionic serve
    
9. Run your app on Genymotion. Run the emulator

    adb devices # it should list your genymotion emulator
    ionic run android --target=e78ab88d # if you only have one device you can omit the --target part
    

9. [Read](http://blog.ionic.io/10-minutes-with-ionic-2-calling-an-api/) about how to use services on ng2 and Ionic to make API calls.
  * Reduce the amount of tabs to 3. Movies, Create and About
  * On home, list the movies from your movies end-point (use the hosted version for the final submission, use the local version for dev purposes)
