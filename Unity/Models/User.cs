using System;

[Serializable]
public class User
{
    public int id;
    public string name;
    public int register_unix_time;

    public DateTime RegisterTime
        => DateTimeOffset.FromUnixTimeSeconds(register_unix_time).DateTime;

    public User() { }
}