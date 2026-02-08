using System;
using System.Collections.Generic;

public enum Language
{
    English,
    Catala
}

public enum Text
{
    Empty,

    Tabaco,

    Total,

    Time, Second, Minute, Hour, Day, Week, Month, Year, LastYear,
    Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday,
    January, February, March, April, May, June, July, August, September, October, November, December,

    WhoAreYou,

    WithNoSmoke,
    SmokedToday,
    
    Username,
    Password,
    Type,
    Date,
    Location,
    Title,
    Save
}

public static class Lang
{
    public static event Action<Language> OnLanguageChange;

    private static readonly Dictionary<Text, TransEntry> english = new()
    {
        { Text.Tabaco, new("Tobacco") },
        { Text.Total, new("Total") },

        // Time ---
        { Text.Time, new("Time") },
        { Text.Second, new("Second") },
        { Text.Minute, new("Minute") },
        { Text.Hour, new("Hour") },
        { Text.Day, new("Day") },
        { Text.Week, new("Week") },
        { Text.Month, new("Month") },
        { Text.Year, new("Year") },
        { Text.LastYear, new("Last year", null) },

        // Days of the week ---
        { Text.Monday, new("Monday") },
        { Text.Tuesday, new("Tuesday") },
        { Text.Wednesday, new("Wednesday") },
        { Text.Thursday, new("Thursday") },
        { Text.Friday, new("Friday") },
        { Text.Saturday, new("Saturday") },
        { Text.Sunday, new("Sunday") },

        // Months ---
        { Text.January, new ("January") },
        { Text.February, new ("February") },
        { Text.March, new ("March") },
        { Text.April, new ("April") },
        { Text.May, new ("May") },
        { Text.June, new ("June") },
        { Text.July, new ("July") },
        { Text.August, new ("August") },
        { Text.September, new ("September") },
        { Text.October, new ("October") },
        { Text.November, new ("November") },
        { Text.December, new ("December") },

        // Sentences ---
        { Text.WhoAreYou, new("Who are you", null) },
        { Text.WithNoSmoke, new("With no smoke", null) },
        { Text.SmokedToday, new("Smoked today", null) },
        
        { Text.Username, new TransEntry("Username") },
        { Text.Password, new TransEntry("Password") },
        { Text.Title, new TransEntry("Title", "Titles") },
        { Text.Save, new TransEntry("Save", null) },
        { Text.Type, new("Type") },
        { Text.Date, new("Date") },
        { Text.Location, new("Location") }
    };
    private static readonly Dictionary<Text, TransEntry> catala = new()
    {
        { Text.Tabaco, new("Tabaco") },
        { Text.Total, new("Total") },

        // Temps ---
        { Text.Time, new("Temps", null) },
        { Text.Second, new("Segon") },
        { Text.Minute, new("Minut") },
        { Text.Hour, new("Hora", "Hores") },
        { Text.Day, new("Dia", "Dies") },
        { Text.Week, new("Setmana", "Setmanes") },
        { Text.Month, new("Mes", "Mesos") },
        { Text.Year, new("Any") },
        { Text.LastYear, new("Ultim any", null) },

        // Dies de la setmana ---
        { Text.Monday, new("Dilluns", null) },
        { Text.Tuesday, new("Dimarts", null) },
        { Text.Wednesday, new("Dimecres", null) },
        { Text.Thursday, new("Dijous", null) },
        { Text.Friday, new("Divendres", null) },
        { Text.Saturday, new("Dissabte", null) },
        { Text.Sunday, new("Diumenge", null) },

        // Mesos ---
        { Text.January, new ("Gener") },
        { Text.February, new ("Febrer") },
        { Text.March, new ("Març", "Marços") },
        { Text.April, new ("Abril") },
        { Text.May, new ("Maig") },
        { Text.June, new ("Juny") },
        { Text.July, new ("Juliol") },
        { Text.August, new ("Agost") },
        { Text.September, new ("Setembre") },
        { Text.October, new ("Octubre") },
        { Text.November, new ("Novembre") },
        { Text.December, new ("Desembre") },

        // Sentences ---
        { Text.WhoAreYou, new("Qui ets?", null) },
        { Text.WithNoSmoke, new("Sense fumar", null) },
        { Text.SmokedToday, new("Fumat avui", "Fumats avui") },
        
        { Text.Username, new TransEntry("Usuari") },
        { Text.Password, new TransEntry("Mot de pas", "Mots de pas") },
        { Text.Title, new TransEntry("Títol", "Títols") },
        { Text.Save, new TransEntry("Guardar", null) },
        { Text.Type, new("Tipus", null) },
        { Text.Date, new("Data", "Dates") },
        { Text.Location, new("Ubicació", "Ubicacións") }
    };

    private static Language _currentLanguage = Language.English;
    public static Language CurrentLanguage
    {
        get => _currentLanguage;
        set
        {
            if (_currentLanguage != value)
            {
                _currentLanguage = value;
                Logger.System.Info($"Language changed to {_currentLanguage}");
                OnLanguageChange?.Invoke(_currentLanguage);
            }
        }
    }

    private static Dictionary<Text, TransEntry> CurrentDictionary
    {
        get => CurrentLanguage switch
        {
            Language.English => english,
            Language.Catala => catala,
            _ => english
        };
    }

    public static string Translate(Text text, int count = 1)
    {
        if (text == Text.Empty) return "null";

        if (count < 0)
        {
            Logger.System.Error($"Count '{count}' can not be less than 0 for text: '{text}' in language: '{CurrentLanguage}'");
            return text.ToString();
        }

        if (!CurrentDictionary.TryGetValue(text, out var transEntry) || transEntry == null)
        {
            Logger.System.Warn($"❓Not found translation: '{text}'({count}) in '{CurrentLanguage}'");
            return text.ToString();
        }

        var transText = transEntry.Get(count);

        Logger.System.Verbose($"Found translation: '{text}'({count}) = '{transText}' in '{CurrentLanguage}'");
        return transText;
    }

    public static string TranslateDayOfWeek(int dayStartFromSundayAsZero, int count = 1)
    {
        return dayStartFromSundayAsZero switch
        {
            0 => Translate(Text.Sunday, count),
            1 => Translate(Text.Monday, count),
            2 => Translate(Text.Tuesday, count),
            3 => Translate(Text.Wednesday, count),
            4 => Translate(Text.Thursday, count),
            5 => Translate(Text.Friday, count),
            6 => Translate(Text.Saturday, count),
            _ => throw new ArgumentOutOfRangeException(nameof(dayStartFromSundayAsZero))
        };
    }
    public static string TranslateDayOfWeek(DateTime date, int count = 1)
        => TranslateDayOfWeek((int)date.DayOfWeek);
    public static string TranslateMonth(int monthStartFromOne, int count = 1)
    {
        return monthStartFromOne switch
        {
            1 =>  Translate(Text.January, count),
            2 =>  Translate(Text.February, count),
            3 =>  Translate(Text.March, count),
            4 =>  Translate(Text.April, count),
            5 =>  Translate(Text.May, count),
            6 =>  Translate(Text.June, count),
            7 =>  Translate(Text.July, count),
            8 =>  Translate(Text.August, count),
            9 =>  Translate(Text.September, count),
            10 => Translate(Text.October, count),
            11 => Translate(Text.November, count),
            12 => Translate(Text.December, count),
            _ => throw new ArgumentOutOfRangeException(nameof(monthStartFromOne))
        };
    }
    public static string TranslateMonth(DateTime month, int count = 1)
        => TranslateMonth(month.Month);

    private class TransEntry
    {
        public string singular;
        public string plural = null;

        public TransEntry(string singular)
        {
            this.singular = singular;
            plural = $"{singular}s";
        }
        public TransEntry(string singular, string plural)
        {
            this.singular = singular;
            this.plural = plural;
        }

        public string Get(int count)
        {
            return count == 1 ? singular
                : plural ?? singular;
        }
    }
}

public static class TextExtensions
{
    public static string Tra(this Text text, int count = 1)
        => Lang.Translate(text, count);
}
