using System;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;

public class Cookie
{
    public const string Emoji = "🍪";
    public const string PhpSessionIdCookieName = "PHPSESSID";

    public string Name { get; set; }
    public string Value { get; set; }
    public DateTime? Expires { get; set; } = null;
    public TimeSpan? MaxAge { get; set; } = null;
    public string Path { get; set; } = null;

    public Cookie(string rawCookie)
    {
        if (string.IsNullOrEmpty(rawCookie))
            throw new ArgumentException("La cookie está vacía.");

        var parts = rawCookie.Trim().Split(';');

        for (var i = 0; i < parts.Length; i++)
        {
            var nameValue = parts[i].Split('=');
            var name = nameValue[0].Trim();
            var value = nameValue[1].Trim();

            if (i == 0)
            {
                Name = name;
                Value = value;
            }
            else if (name.ToLower() == "expires")
            {
                if (DateTime.TryParse(value, out DateTime expires))
                {
                    Expires = expires;
                }
            }
            else if (name.ToLower() == "max-age")
            {
                if (int.TryParse(value, out int seconds))
                {
                    MaxAge = TimeSpan.FromSeconds(seconds);
                }
            }
            else if (name.ToLower() == "path")
            {
                Path = value;
            }
        }
    }

    public bool IsExpired()
    {
        return Expires.HasValue && Expires.Value.ToUniversalTime() < DateTime.UtcNow;
    }

    public string ToRaw()
    {
        var rawCookie = $"{Name}={Value}";
        if (Expires.HasValue)
        {
            rawCookie += "; expires=" + Expires.Value.ToUniversalTime();
        }
        if (MaxAge.HasValue)
        {
            rawCookie += "; Max-Age=" + MaxAge.Value.TotalSeconds;
        }
        if (Path != null)
        {
            rawCookie += "; path=" + Path;
        }

        return rawCookie;
    }

    public override string ToString()
    {
        var s = $"{Emoji} ";

        if (IsExpired()) s += "(EXPIRED)";

        return s + ToRaw();
    }
}

public static class Storage
{
    public enum Key
    {
        _cookieJar
    }

    public static List<Cookie> CookieJar
    {
        get
        {
            var rawCookieJar = GetString(Key._cookieJar);
            
            return string.IsNullOrEmpty(rawCookieJar) ? new List<Cookie>()
                : rawCookieJar
                    .Split(Environment.NewLine)
                    .Select(raw => new Cookie(raw))
                    .Where(c => !c.IsExpired())
                    .ToList();
        }
        private set
        {
            var validRawCookies = value
                .Where(c => !c.IsExpired())
                .Select(r => r.ToRaw());

            Set(Key._cookieJar, string.Join(Environment.NewLine, validRawCookies));
        }
    }

    public static bool Exists(Key key)
        => PlayerPrefs.HasKey(key.ToString());

    // Get ---
    public static int? GetInt(Key key)
        => Exists(key) ? PlayerPrefs.GetInt(key.ToString()) : null;
    public static float? GetFloat(Key key)
        => Exists(key) ? PlayerPrefs.GetFloat(key.ToString()) : null;
    public static string GetString(Key key)
        => Exists(key) ? PlayerPrefs.GetString(key.ToString()) : null;
    public static Cookie GetCookie(string name)
        => CookieJar.FirstOrDefault(c => c.Name == name);

    // Set ---
    public static void Set(Key key, int value)
    {
        Logger.Storage.Verbose($"Set <int> [{key}]={value}");

        PlayerPrefs.SetInt(key.ToString(), value);
        Save();
    }
    public static void Set(Key key, float value)
    {
        Logger.Storage.Verbose($"Set <float> [{key}]={value}");

        PlayerPrefs.SetFloat(key.ToString(), value);
        Save();
    }
    public static void Set(Key key, string value)
    {
        if (key != Key._cookieJar)
        {
            Logger.Storage.Verbose($"Set <string> [{key}]=\"{value}\"");
        }

        PlayerPrefs.SetString(key.ToString(), value);
        Save();
    }
    public static void Set(Cookie cookie)
    {
        Logger.Storage.Verbose($"Set cookie: {cookie}");

        var jar = CookieJar;
        jar.RemoveAll(c => c.Name == cookie.Name);
        jar.Add(cookie);
        CookieJar = jar;
    }

    // Delete ---
    public static void Delete(Key key)
    {
        Logger.Storage.Verbose($"Delete key: {key}");

        PlayerPrefs.DeleteKey(key.ToString());
        Save();
    }
    public static void Delete(Cookie cookie)
    {
        Logger.Storage.Verbose($"Delete cookie: {cookie}");

        var jar = CookieJar;
        jar.RemoveAll(c => c.Name == cookie.Name);
        CookieJar = jar;
    }
    public static void DeleteCookieByName(string name)
    {
        var cookie = CookieJar.Find(c => c.Name == name);
        if (cookie != null)
        {
            Delete(cookie);
        }
    }
    public static void DeleteAllCookies()
    {
        Logger.Storage.Info($"{Cookie.Emoji} Delete all cookies");

        Delete(Key._cookieJar);
    }

    // Save ---
    private static void Save()
        => PlayerPrefs.Save();
}