package com.sven4321.trainer1x1

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.browser.customtabs.CustomTabsIntent

class MainActivity : AppCompatActivity() {

    private val PWA_URL = "https://s540d.github.io/1x1_Trainer/"

    override fun onCreate(savedInstanceState: Bundle?) {
        // Enable Edge-to-Edge BEFORE super.onCreate() for Android 15+ compatibility
        // This provides automatic backward compatibility and proper system bar handling
        enableEdgeToEdge()

        super.onCreate(savedInstanceState)

        // Check if launched via deep link or directly
        val url = intent.data?.toString() ?: PWA_URL

        // Launch PWA in TWA (CustomTab)
        // The activity will finish itself after successfully launching the tab
        launchPWA(url)
    }

    private fun launchPWA(url: String) {
        try {
            // Create CustomTabs intent for TWA
            val builder = CustomTabsIntent.Builder()
                .setShowTitle(false)
                .setInstantAppsEnabled(true)
                .setUrlBarHidingEnabled(true)

            val customTabsIntent = builder.build()

            // Set FLAG_ACTIVITY_NEW_TASK to open CustomTab in separate task
            customTabsIntent.intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)

            customTabsIntent.launchUrl(this, Uri.parse(url))

            // Finish this activity after successfully launching the CustomTab
            finish()

        } catch (e: Exception) {
            // Fallback: Open in system browser
            val intent = Intent(Intent.ACTION_VIEW).apply {
                data = Uri.parse(url)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            startActivity(intent)
            finish()
        }
    }
}