class Log {

  static _DebugEnabled = false;
  static Debug(source, ...args) {
    if (Log._DebugEnabled) {
      let prefix = Log._Date() + ' [' + source + ']';
      console.log(prefix, ...args);
    }
  }

  static Warn(source, ...args) {
    let prefix = Log._Date() + ' [' + source + ']';
    console.warn(prefix, ...args);
  }

  static Error(source, ...args) {
    let prefix = Log._Date() + ' [' + source + ']';
    console.error(prefix, ...args);
  }

  static EnableDebug() {
    Log._DebugEnabled = true;
  }

  static _Date() {
    let d = new Date();
    return d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
  }
}

export default Log;