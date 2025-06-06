using System.Collections;
using UnityEngine.Networking;
using System.Text;
using System;
using UnityEngine;
using System.Text.RegularExpressions;

public enum RequestMethod
{
    Post,
    Get,
    Put,
    Delete
}

public static class Api
{
    private const string BaseUrl = "http://localhost/tabaco/php/";

    [Serializable]
    private class ErrorResponse
    {
        public string status;
        public int code;
        public string text;

        public static bool TryParse(string maybeError, out ErrorResponse error)
        {
            error = null;

            if (maybeError == null) { return false; }

            try
            {
                error = JsonUtility.FromJson<ErrorResponse>(maybeError);

                return error.status == "ERROR";
            }
            catch (ArgumentException)
            {
                return false;
            }
        }

        public override string ToString()
        {
            return $"ErrorMeu {code}: {text}";
        }
    }

    public static IEnumerator SendRequest(string endpoint, RequestMethod method, string data = null, Action<string> onSuccess = null, Action<string> onError = null)
    {
        Logger.Debug($"🌐⬆️ {method} request to \"{endpoint}\" with data: \"{data}\"");

        var uri = BaseUrl + endpoint;

        UnityWebRequest request = method switch
        {
            RequestMethod.Post => new UnityWebRequest(uri, RequestMethod.Post.ToString()),
            RequestMethod.Get => UnityWebRequest.Get(uri),
            RequestMethod.Put => new UnityWebRequest(uri, RequestMethod.Put.ToString()),
            RequestMethod.Delete => UnityWebRequest.Delete(uri),
            _ => throw new ArgumentOutOfRangeException($"Request method [{method}] not found")
        };

        AddBody(request, data);
        SetHeaders(request);
        
        yield return request.SendWebRequest();

        CaptureCookies(request);

        // Handle maybe errors
        HandleResponse(request, onSuccess, onError);
    }

    public static IEnumerator Get(string endpoint, string data = null, Action<string> onSuccess = null, Action<string> onError = null)
        => SendRequest(endpoint, RequestMethod.Get, data, onSuccess, onError);
    public static IEnumerator Post(string endpoint, string data = null, Action<string> onSuccess = null, Action<string> onError = null)
        => SendRequest(endpoint, RequestMethod.Post, data, onSuccess, onError);
    public static IEnumerator Put(string endpoint, string data = null, Action<string> onSuccess = null, Action<string> onError = null)
        => SendRequest(endpoint, RequestMethod.Put, data, onSuccess, onError);
    public static IEnumerator Delete(string endpoint, string data = null, Action<string> onSuccess = null, Action<string> onError = null)
        => SendRequest(endpoint, RequestMethod.Delete, data, onSuccess, onError);

    private static void AddBody(UnityWebRequest request, string json)
    {
        if (json != null)
        {
            byte[] bodyRaw = Encoding.UTF8.GetBytes(json);
            request.uploadHandler = new UploadHandlerRaw(bodyRaw);
            request.downloadHandler = new DownloadHandlerBuffer();
        }
    }
    private static void SetHeaders(UnityWebRequest request)
    {
        request.SetRequestHeader("Content-Type", "application/json");
        if (Storage.CookieJar.Count > 0)
        {
            if(Logger.CurrentLogLevel == LogLevel.Verbose) foreach (var cookie in Storage.CookieJar)
            {
                Logger.Verbose("🍪⬆️: " + cookie);
            }
            request.SetRequestHeader("Cookie", string.Join(',', Storage.CookieJar));
        }
    }
    private static void CaptureCookies(UnityWebRequest request)
    {
        Storage.DeleteCookies();
        string allRawCookies = request.GetResponseHeader("Set-Cookie");

        if (!string.IsNullOrEmpty(allRawCookies))
        {
            var cookiesList = Regex.Split(allRawCookies, ",(?! )");

            foreach (var rawCookie in cookiesList)
            {
                Logger.Verbose("🍪⬇️: " + rawCookie);
                Storage.Set(new Cookie(rawCookie));
            }
        }
    }

    private static void HandleResponse(UnityWebRequest request, Action<string> onSuccess, Action<string> onError)
    {
        if (request.result == UnityWebRequest.Result.Success)
        {
            var res = request?.downloadHandler?.text;

            if (res == "null") { res = null; }

            if (ErrorResponse.TryParse(res, out var error))
            {
                Logger.Error(error);
                onError?.Invoke(error.text);
            }
            else
            {
                Logger.Debug($"🌐⬇️ Response [{res?.Length}]: {res}");
                onSuccess?.Invoke(res);
            }
        }
        else
        {
            Logger.Error($"Error {request.responseCode}: {request.error}");
            onError?.Invoke(request.error);
        }
    }
}