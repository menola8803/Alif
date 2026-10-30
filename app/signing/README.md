This folder holds only public information.

`cert-sha256.txt` is the SHA-256 fingerprint of the certificate that Alif is signed with. The release build compares the
APK it made with it and stops if they differ, so a release is never published signed with the wrong key. The private key
is NOT here and never goes into the repository: it lives only in the GitHub secrets ALIF_KEYSTORE_BASE64,
ALIF_KEYSTORE_PASSWORD, ALIF_KEY_PASSWORD and ALIF_KEY_ALIAS (and in the owner's safe copy).
