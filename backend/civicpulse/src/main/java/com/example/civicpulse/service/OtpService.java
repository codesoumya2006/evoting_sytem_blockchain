package com.example.civicpulse.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    private final Map<String, OtpData> otpStorage = new ConcurrentHashMap<>();
    private final SecureRandom random = new SecureRandom();

    @Value("${SMS_API_KEY:}")
    private String smsApiKey;

    private String cleanMobile(String mobileNumber) {
        String cleanMobile = mobileNumber.trim().replaceAll("\\s+", "");
        if (cleanMobile.startsWith("+91")) {
            cleanMobile = cleanMobile.substring(3);
        } else if (cleanMobile.startsWith("0")) {
            cleanMobile = cleanMobile.substring(1);
        }
        return cleanMobile;
    }

    public String generateAndSendOtp(String mobileNumber) {
        String cleanMobile = cleanMobile(mobileNumber);

        String otp = String.format("%06d", random.nextInt(1000000));

        OtpData data = new OtpData(otp, LocalDateTime.now().plusMinutes(5));
        otpStorage.put(cleanMobile, data);

        System.out.println("🔐 Securely generated OTP for " + cleanMobile + " is: " + otp);

        if (smsApiKey == null || smsApiKey.isEmpty()) {
            System.err.println("❌ SMS Gateway Error: SMS_API_KEY is missing in Render Environment Settings.");
            return otp;
        }

        try {
            String urlString = "https://www.fast2sms.com/dev/bulkV2"
                             + "?authorization=" + smsApiKey.trim()
                             + "&variables_values=" + otp
                             + "&route=otp"
                             + "&numbers=" + cleanMobile;

            URL url = new URL(urlString);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setRequestProperty("User-Agent", "Mozilla/5.0");
            conn.setRequestProperty("Accept", "application/json");

            int responseCode = conn.getResponseCode();
            if (responseCode == HttpURLConnection.HTTP_OK) {
                BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                StringBuilder response = new StringBuilder();
                String inputLine;
                while ((inputLine = in.readLine()) != null) {
                    response.append(inputLine);
                }
                in.close();
                System.out.println("🚀 SMS Gateway Response: " + response.toString());
            } else {
                System.err.println("❌ SMS Gateway HTTP Error Code: " + responseCode);
                if (conn.getErrorStream() != null) {
                    BufferedReader errorIn = new BufferedReader(new InputStreamReader(conn.getErrorStream()));
                    String errorLine;
                    while ((errorLine = errorIn.readLine()) != null) {
                        System.err.println("Detailed Gateway Error Message: " + errorLine);
                    }
                    errorIn.close();
                }
            }
        } catch (Exception e) {
            System.err.println("❌ Failed to reach SMS network gateway: " + e.getMessage());
        }

        return otp;
    }

    public boolean verifyOtp(String mobileNumber, String inputOtp) {
        String cleanMobile = cleanMobile(mobileNumber);

        OtpData data = otpStorage.get(cleanMobile);

        if (data == null) return false;
        if (LocalDateTime.now().isAfter(data.expiry)) {
            otpStorage.remove(cleanMobile);
            return false;
        }

        boolean valid = data.otp.equals(inputOtp.trim());
        if (valid) {
            otpStorage.remove(cleanMobile);
        }
        return valid;
    }

    private static class OtpData {
        String otp;
        LocalDateTime expiry;

        OtpData(String otp, LocalDateTime expiry) {
            this.otp = otp;
            this.expiry = expiry;
        }
    }
}
