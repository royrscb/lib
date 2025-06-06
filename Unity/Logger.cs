using System;

public enum LogLevel
{
    Verbose = 0,    // Mensajes muy detallados, útiles para rastrear cada paso
    Debug   = 1,    // Mensajes para depurar flujos específicos
    Info    = 2,    // Mensajes “informativos” generales
    Warning = 3,    // Advertencias
    Error   = 4,    // Errores críticos
    None    = 5     // Ningún log, silencia TODO
}

public static class Logger
{
    /// <summary>
    /// Nivel mínimo de log que queremos ver. 
    /// Si un mensaje tiene un LogLevel menor (más “detallado”) que esto, no se mostrará.
    /// Por defecto ponemos Info para evitar demasiados mensajes Verbose/Debug en producción.
    /// </summary>
    public static LogLevel CurrentLogLevel { get; set; } = LogLevel.Verbose;

    public static void Verbose(object mensaje, UnityEngine.Object contexto = null)
    {
        if (CurrentLogLevel <= LogLevel.Verbose)
        {
            UnityEngine.Debug.Log($"[VERBOSE] {mensaje}", contexto);
        }
    }

    public static void Debug(object mensaje, UnityEngine.Object contexto = null)
    {
        if (CurrentLogLevel <= LogLevel.Debug)
        {
            UnityEngine.Debug.Log($"[DEBUG] {mensaje}", contexto);
        }
    }

    public static void Info(object mensaje, UnityEngine.Object contexto = null)
    {
        if (CurrentLogLevel <= LogLevel.Info)
        {
            UnityEngine.Debug.Log($"[INFO] {mensaje}", contexto);
        }
    }

    public static void Warn(object mensaje, UnityEngine.Object contexto = null)
    {
        if (CurrentLogLevel <= LogLevel.Warning)
        {
            UnityEngine.Debug.LogWarning(mensaje, contexto);
        }
    }

    public static void Error(object mensaje, UnityEngine.Object contexto = null)
    {
        if (CurrentLogLevel <= LogLevel.Error)
        {
            UnityEngine.Debug.LogError(mensaje, contexto);
        }
    }

    public static void Exception(Exception ex, UnityEngine.Object contexto = null)
    {
        // Siempre mostramos excepciones si el nivel es Error o menor
        if (CurrentLogLevel <= LogLevel.Error)
        {
            UnityEngine.Debug.LogException(ex, contexto);
        }
    }
}
