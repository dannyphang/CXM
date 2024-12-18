function responseModel({ data = null, isSuccess = true, responseMessage = null }) {
    return {
        data: data,
        isSuccess: isSuccess,
        responseMessage: responseMessage,
    };
}

function body(data) {
    return {
        data: data.body,
        tenantId: data.headers.tenantid ?? "",
        userId: data.headers.userid ?? "",
        headers: data.headers,
    };
}

export { responseModel, body };
