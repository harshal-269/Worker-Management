
package com.localworker.backend.dto;

public class OAuthExchangeRequest {

    private String code;

    public OAuthExchangeRequest() {
    }

    public OAuthExchangeRequest(String code) {
        this.code = code;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }
}
