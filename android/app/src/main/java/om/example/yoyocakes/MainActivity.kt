package om.example.yoyocakes

import android.os.Bundle
import android.util.Log
import com.getcapacitor.BridgeActivity
import com.google.firebase.Firebase
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseUser
import com.google.firebase.auth.GoogleAuthProvider
import com.google.firebase.auth.PhoneAuthCredential
import com.google.firebase.auth.PhoneAuthOptions
import com.google.firebase.auth.PhoneAuthProvider
import com.google.firebase.auth.auth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.firestore
import java.util.concurrent.TimeUnit

class MainActivity : BridgeActivity() {

    private lateinit var auth: FirebaseAuth
    private lateinit var db: FirebaseFirestore

    companion object {
        private const val TAG = "YoyoCakesAuth"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Initialize Firebase Authentication & Cloud Firestore
        auth = Firebase.auth
        db = Firebase.firestore

        Log.d(TAG, "YOYO CAKES Firebase SDK initialized successfully for project: yoyo-c46c3")
    }

    override fun onStart() {
        super.onStart()
        // Check if user is currently signed in
        val currentUser = auth.currentUser
        updateUI(currentUser)
    }

    // -------------------------------------------------------------
    // 1. Email / Password Authentication
    // -------------------------------------------------------------
    fun registerWithEmail(email: String, pass: String, onComplete: (Boolean, String?) -> Unit) {
        auth.createUserWithEmailAndPassword(email, pass)
            .addOnCompleteListener(this) { task ->
                if (task.isSuccessful) {
                    val user = auth.currentUser
                    saveUserToFirestore(user)
                    onComplete(true, null)
                } else {
                    onComplete(false, task.exception?.localizedMessage)
                }
            }
    }

    fun signInWithEmail(email: String, pass: String, onComplete: (Boolean, String?) -> Unit) {
        auth.signInWithEmailAndPassword(email, pass)
            .addOnCompleteListener(this) { task ->
                if (task.isSuccessful) {
                    onComplete(true, null)
                } else {
                    onComplete(false, task.exception?.localizedMessage)
                }
            }
    }

    // -------------------------------------------------------------
    // 2. Google Sign-In
    // -------------------------------------------------------------
    fun firebaseAuthWithGoogle(idToken: String, onComplete: (Boolean, String?) -> Unit) {
        val credential = GoogleAuthProvider.getCredential(idToken, null)
        auth.signInWithCredential(credential)
            .addOnCompleteListener(this) { task ->
                if (task.isSuccessful) {
                    saveUserToFirestore(auth.currentUser)
                    onComplete(true, null)
                } else {
                    onComplete(false, task.exception?.localizedMessage)
                }
            }
    }

    // -------------------------------------------------------------
    // 3. Phone Authentication (SMS OTP)
    // -------------------------------------------------------------
    fun startPhoneNumberVerification(
        phoneNumber: String,
        callbacks: PhoneAuthProvider.OnVerificationStateChangedCallbacks
    ) {
        val options = PhoneAuthOptions.newBuilder(auth)
            .setPhoneNumber(phoneNumber)
            .setTimeout(60L, TimeUnit.SECONDS)
            .setActivity(this)
            .setCallbacks(callbacks)
            .build()
        PhoneAuthProvider.verifyPhoneNumber(options)
    }

    fun signInWithPhoneAuthCredential(
        credential: PhoneAuthCredential,
        onComplete: (Boolean, String?) -> Unit
    ) {
        auth.signInWithCredential(credential)
            .addOnCompleteListener(this) { task ->
                if (task.isSuccessful) {
                    saveUserToFirestore(auth.currentUser)
                    onComplete(true, null)
                } else {
                    onComplete(false, task.exception?.localizedMessage)
                }
            }
    }

    // -------------------------------------------------------------
    // 4. Firestore Integration
    // -------------------------------------------------------------
    private fun saveUserToFirestore(user: FirebaseUser?) {
        if (user == null) return
        val userData = hashMapOf(
            "uid" to user.uid,
            "email" to (user.email ?: ""),
            "displayName" to (user.displayName ?: ""),
            "phoneNumber" to (user.phoneNumber ?: ""),
            "lastLogin" to com.google.firebase.Timestamp.now()
        )
        db.collection("users").document(user.uid)
            .set(userData, com.google.firebase.firestore.SetOptions.merge())
            .addOnSuccessListener {
                Log.d(TAG, "Customer profile synced to Firestore: ${user.uid}")
            }
    }

    fun signOut() {
        auth.signOut()
        updateUI(null)
    }

    private fun updateUI(user: FirebaseUser?) {
        Log.d(TAG, "Current auth state: ${user?.email ?: user?.phoneNumber ?: "Signed Out"}")
    }
}
