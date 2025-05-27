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

function convertFirebaseDateFormat(date) {
    try {
        return date ? date.toDate() : date;
    } catch {
        return;
    }
}

function returnParamDataUrl(params) {
    const query = Object.entries(params)
        .filter(([_, value]) => value !== undefined && value !== null)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join("&");

    return query ? `?${query}` : "";
}

export { responseModel, body, convertFirebaseDateFormat, returnParamDataUrl };
