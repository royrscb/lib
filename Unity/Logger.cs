using System;

// Loggers ---
public class Logger
{
    // For unity GUI ---
    public static LogLevel CurrentLogLevel { get; set; } = LogLevel.Info;
    public static LogFilters Filters { get; set; } = new();
    // ---

    // Static predefined loggers
    public static Logger Common { get; } = new();
    public static Logger System { get; } = new Logger(LogFilter.System);
    public static Logger Storage { get; } = new Logger(LogFilter.Storage);
    public static Logger Api { get; } = new Logger(LogFilter.Api);
    public static Logger Ui { get; } = new Logger(LogFilter.Ui);

    // Instance fields ---
    public readonly string emoji = null;
    private readonly LogFilter? _filter = null;

    // Constructor ---
    public Logger(LogFilter? filter = null, string emoji = null)
    {
        _filter = filter;
        this.emoji = emoji ?? filter.Emoji();
    }

    // Public ---
    public void Log(LogLevel logLevel, object message, UnityEngine.Object context = null)
    {
        if (Filters.IsEnabled(_filter) && CurrentLogLevel <= logLevel)
        {
            if (logLevel <= LogLevel.Info)
            {
                UnityEngine.Debug.Log($"{emoji}[{logLevel.ToString().ToUpper()}] {message}", context);
            }
            else if (logLevel == LogLevel.Warning)
            {
                var emoji = string.IsNullOrEmpty(this.emoji) ? "" : this.emoji + " ";
                UnityEngine.Debug.LogWarning(emoji + message, context);
            }
            else if (logLevel == LogLevel.Error)
            {
                var emoji = string.IsNullOrEmpty(this.emoji) ? "" : this.emoji + " ";
                UnityEngine.Debug.LogError(emoji + message, context);
            }
            else
            {
                throw new ArgumentOutOfRangeException("LogLevel", $"LogLevel \"{logLevel}\" not found");
            }
        }
    }

    public void Verbose(object message, UnityEngine.Object context = null)
        => Log(LogLevel.Verbose, message, context);
    public void Debug(object message, UnityEngine.Object context = null)
        => Log(LogLevel.Debug, message, context);
    public void Info(object message, UnityEngine.Object context = null)
        => Log(LogLevel.Info, message, context);
    public void Warn(object message, UnityEngine.Object context = null)
        => Log(LogLevel.Warning, message, context);
    public void Error(object message, UnityEngine.Object context = null)
        => Log(LogLevel.Error, message, context);
    public void Exception(Exception ex, UnityEngine.Object context = null)
    {
        if (CurrentLogLevel <= LogLevel.Error)
        {
            UnityEngine.Debug.LogException(ex, context);
        }
    }
    public void Always(object message, UnityEngine.Object context = null)
    {
        UnityEngine.Debug.Log($"{emoji}[ALWAYS] {message}", context);
    }

    public void Tmp(object message, UnityEngine.Object context = null)
    {
        if (Filters.IsEnabled(_filter))
        {
            UnityEngine.Debug.Log($"🚧{emoji}[TMP] {message}", context);
        }
    }

    // Static ---
    public static void Tmp(object message, UnityEngine.Object context = null, int _ = 0)
        => Common.Tmp(message, context);
}

// Enums ---
public enum LogLevel
{
    Verbose = 0,    // messages muy detallados, útiles para rastrear cada paso
    Debug = 1,    // messages para depurar flujos específicos
    Info = 2,    // messages “informativos” generales
    Warning = 3,    // Advertencias
    Error = 4,    // Errores críticos
    None = 5     // Ningún log, silencia TODO
}

public enum LogFilter {
    System,
    Storage,
    Api,
    Ui
}

// Classes ---
[Serializable]
public class LogFilters
{
    public bool system = true;
    public bool storage = true;
    public bool api = true;
    public bool ui = true;

    public bool IsEnabled(LogFilter? logFilter)
    {
        return logFilter switch
        {
            null => true,
            LogFilter.System => system,
            LogFilter.Storage => storage,
            LogFilter.Api => api,
            LogFilter.Ui => ui,
            _ => throw new ArgumentOutOfRangeException("LogFilter", $"LogFilter \"{logFilter}\" not found")
        };
    }
}

// Extensions ---
internal static class LogFilterEnumExtensions
{
    public static string Emoji(this LogFilter? logFilter)
    {
        return logFilter switch
        {
            null => null,
            LogFilter.System => "⚙️",
            LogFilter.Storage => "🗄️",
            LogFilter.Api => "🌐",
            LogFilter.Ui => "🧩",
            _ => throw new ArgumentOutOfRangeException("LogFilter", $"LogFilter \"{logFilter}\" not found")
        };
    }
}
