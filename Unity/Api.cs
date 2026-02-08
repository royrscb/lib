using UnityEngine.Networking;
using System.Text;
using System;
using Newtonsoft.Json;
using UnityEngine;
using System.Text.RegularExpressions;
using System.Linq;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;

public static class Api
{
    public static string BaseUrl
    {
        get
        {
            return "http://localhost/tabaco/php/"; 
        }
    }

    // Public -----------------------------------
    public static async Task<string> SendRequest(RequestMethod method, string url, string json = null)
    {
        Logger.Api.Debug($"🔺{method.ToString().ToUpper()} request to '{url}' with json: '{json}'");

        UnityWebRequest request = method switch
        {
            RequestMethod.Post => new UnityWebRequest(url, RequestMethod.Post.ToString().ToUpper()),
            RequestMethod.Get => UnityWebRequest.Get(url),
            RequestMethod.Put => new UnityWebRequest(url, RequestMethod.Put.ToString().ToUpper()),
            RequestMethod.Delete => UnityWebRequest.Delete(url),
            _ => throw new ArgumentOutOfRangeException($"Request method [{method}] not found")
        };

        AddBody(request, json);
        SetHeaders(request);

        await request.SendWebRequest();

        CaptureCookies(request);

        return HandleResponse(request);
    }

    // Get ---
    public static Task<string> Get(string url, string json = null)
        => SendRequest(RequestMethod.Get, url, json);
    public static async Task<T> GetById<T>(int id)
    {
        Logger.Api.Debug($"Get by id [{id}] <{typeof(T).Name}>");

        var response = await Get(GetApiUrl<T>(), JsonConvert.SerializeObject(new { id }));
        return JsonConvert.DeserializeObject<T>(response);
    }
    public static async Task<List<T>> GetAll<T>()
    {
        Logger.Api.Debug($"Get all <{typeof(T).Name}>");

        var response = await Get(GetApiUrl<T>());
        return JsonConvert.DeserializeObject<List<T>>(response);
    }

    // Post ---
    public static Task<string> Post(string url, string json)
        => SendRequest(RequestMethod.Post, url, json);
    public static async Task<T> Post<T>(T entity) where T : class
    {
        Logger.Api.Debug($"POST <{typeof(T).Name}> {entity}");

        var json = JsonConvert.SerializeObject(new { data = entity });
        var response = await Post(GetApiUrl<T>(), json);

        return JsonConvert.DeserializeObject<T>(response);
    }
    // Put ---
    public static Task<string> Put(string url, string json = null)
        => SendRequest(RequestMethod.Put, url, json);
    public static async Task<T> Put<T>(int id, JObject jsonData)
    {
        Logger.Api.Debug($"PUT <{typeof(T).Name}> [{id}] {jsonData}");

        jsonData["id"] = id;
        var json = JsonConvert.SerializeObject(new { data = jsonData });
        var response = await Put(GetApiUrl<T>(), json);

        return JsonConvert.DeserializeObject<T>(response);
    }

    // Delete ---
    public static Task<string> Delete(string url, string json = null)
        => SendRequest(RequestMethod.Delete, url, json);
    public static async Task Delete<T>(int id)
    {
        Logger.Api.Debug($"DELETE <{typeof(T).Name}> with id [{id}]");

        var json = JsonConvert.SerializeObject(new { id });
        await Delete(GetApiUrl<T>(), json);
    }

    // Private ----------------------------------
    private static string GetApiUrl<T>()
    {
        var objectName = typeof(T).Name.ToLower();
        return Path.Combine(BaseUrl, $"api/{objectName}.php");
    }

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

        var cookieJar = Storage.CookieJar;
        if (cookieJar.Count > 0)
        {
            cookieJar.ForEach(c => Logger.Api.Verbose("🔺 " + c));

            var rawCookies = cookieJar.Select(c => c.ToRaw());
            request.SetRequestHeader("Cookie", string.Join(',', rawCookies));
        }
    }
    private static void CaptureCookies(UnityWebRequest request)
    {
        string allRawCookies = request.GetResponseHeader("Set-Cookie");

        if (!string.IsNullOrEmpty(allRawCookies))
        {
            var cookiesList = Regex.Split(allRawCookies, ",(?! )");

            foreach (var rawCookie in cookiesList)
            {
                var cookie = new Cookie(rawCookie);

                Logger.Api.Verbose($"🔻 {cookie}");

                if (cookie.Value.ToLower() == "deleted")
                {
                    Storage.Delete(cookie);
                }
                else if (!cookie.IsExpired())
                {
                    Storage.Set(new Cookie(rawCookie));
                }
            }
        }
    }
    private static string HandleResponse(UnityWebRequest request)
    {
        if (request.result != UnityWebRequest.Result.Success)
        {
            var ex = new ServerException((int)request.responseCode, request.error);
            Laui.Pop.ToastError($"Server exception {ex.Code}: {ex.MessageText}");

            throw ex;
        }

        var res = request?.downloadHandler?.text;
        if (res == "null" || res.IsNullOrEmpty())
        {
            res = null;
        }

        if (ErrorResponse.TryParse(res, out var error))
        {
            var ex = new ValidationException(error.Code, error.Text);
            Laui.Pop.ToastError(ex.MessageText);

            throw ex;
        }

        Logger.Api.Debug($"🔻Response [{res?.Length}]: {res}");
        return res;
    }

    // Enums and classes ------------------------
    public enum RequestMethod
    {
        Post,
        Get,
        Put,
        Delete
    }

    private class ErrorResponse
    {
        [JsonProperty("status")]
        public string Status { get; set; }

        [JsonProperty("code")]
        public int Code { get; set; }

        [JsonProperty("text")]
        public string Text { get; set; }

        public static bool TryParse(string maybeError, out ErrorResponse error)
        {
            error = null;

            if (maybeError == null) { return false; }

            try
            {
                error = JsonConvert.DeserializeObject<ErrorResponse>(maybeError);

                return error?.Status == "ERROR";
            }
            catch (JsonSerializationException)
            {
                return false;
            }
        }

        public override string ToString()
        {
            return $"ErrorMeu {Code}: {Text}";
        }
    }
}
