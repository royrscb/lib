using System;
using System.Collections;
using UnityEngine;

public class Auth
{
    [Serializable]
    private class Credentials
    {
        public string username;
        public string password;

        public Credentials(string username, string password)
        {
            this.username = username;
            this.password = password;
        }
    }

    public static IEnumerator Login(Action<User> onSuccess, Action<string> onError = null)
    {
        return Api.Get(
            endpoint: "interface/login.php",
            data: null,
            onSuccess: jsonUser =>
            {
                if (string.IsNullOrEmpty(jsonUser)) onSuccess(null);
                else onSuccess(JsonUtility.FromJson<User>(jsonUser));
            },
            onError: onError
        );
    }

    public static IEnumerator Login(string username, string password, Action<User> onSuccess, Action<string> onError = null)
    {
        return Api.Post(
            endpoint: "interface/login.php",
            data: JsonUtility.ToJson(new Credentials(username, password)),
            onSuccess: jsonUser => onSuccess(JsonUtility.FromJson<User>(jsonUser)),
            onError: onError
        );
    }
}