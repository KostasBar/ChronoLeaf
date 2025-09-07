function Qr(t) {
  return t && t.__esModule && Object.prototype.hasOwnProperty.call(t, "default") ? t.default : t;
}
var ve = { exports: {} };
/* @license
Papa Parse
v5.5.3
https://github.com/mholt/PapaParse
License: MIT
*/
var Jr = ve.exports, Tn;
function jr() {
  return Tn || (Tn = 1, function(t, e) {
    ((n, r) => {
      t.exports = r();
    })(Jr, function n() {
      var r = typeof self < "u" ? self : typeof window < "u" ? window : r !== void 0 ? r : {}, i, o = !r.document && !!r.postMessage, a = r.IS_PAPA_WORKER || !1, s = {}, l = 0, u = {};
      function c(f) {
        this._handle = null, this._finished = !1, this._completed = !1, this._halted = !1, this._input = null, this._baseIndex = 0, this._partialLine = "", this._rowCount = 0, this._start = 0, this._nextChunk = null, this.isFirstChunk = !0, this._completeResults = { data: [], errors: [], meta: {} }, (function(h) {
          var x = K(h);
          x.chunkSize = parseInt(x.chunkSize), h.step || h.chunk || (x.chunkSize = null), this._handle = new $(x), (this._handle.streamer = this)._config = x;
        }).call(this, f), this.parseChunk = function(h, x) {
          var E = parseInt(this._config.skipFirstNLines) || 0;
          if (this.isFirstChunk && 0 < E) {
            let W = this._config.newline;
            W || (D = this._config.quoteChar || '"', W = this._handle.guessLineEndings(h, D)), h = [...h.split(W).slice(E)].join(W);
          }
          this.isFirstChunk && z(this._config.beforeFirstChunk) && (D = this._config.beforeFirstChunk(h)) !== void 0 && (h = D), this.isFirstChunk = !1, this._halted = !1;
          var E = this._partialLine + h, D = (this._partialLine = "", this._handle.parse(E, this._baseIndex, !this._finished));
          if (!this._handle.paused() && !this._handle.aborted()) {
            if (h = D.meta.cursor, E = (this._finished || (this._partialLine = E.substring(h - this._baseIndex), this._baseIndex = h), D && D.data && (this._rowCount += D.data.length), this._finished || this._config.preview && this._rowCount >= this._config.preview), a) r.postMessage({ results: D, workerId: u.WORKER_ID, finished: E });
            else if (z(this._config.chunk) && !x) {
              if (this._config.chunk(D, this._handle), this._handle.paused() || this._handle.aborted()) return void (this._halted = !0);
              this._completeResults = D = void 0;
            }
            return this._config.step || this._config.chunk || (this._completeResults.data = this._completeResults.data.concat(D.data), this._completeResults.errors = this._completeResults.errors.concat(D.errors), this._completeResults.meta = D.meta), this._completed || !E || !z(this._config.complete) || D && D.meta.aborted || (this._config.complete(this._completeResults, this._input), this._completed = !0), E || D && D.meta.paused || this._nextChunk(), D;
          }
          this._halted = !0;
        }, this._sendError = function(h) {
          z(this._config.error) ? this._config.error(h) : a && this._config.error && r.postMessage({ workerId: u.WORKER_ID, error: h, finished: !1 });
        };
      }
      function g(f) {
        var h;
        (f = f || {}).chunkSize || (f.chunkSize = u.RemoteChunkSize), c.call(this, f), this._nextChunk = o ? function() {
          this._readChunk(), this._chunkLoaded();
        } : function() {
          this._readChunk();
        }, this.stream = function(x) {
          this._input = x, this._nextChunk();
        }, this._readChunk = function() {
          if (this._finished) this._chunkLoaded();
          else {
            if (h = new XMLHttpRequest(), this._config.withCredentials && (h.withCredentials = this._config.withCredentials), o || (h.onload = A(this._chunkLoaded, this), h.onerror = A(this._chunkError, this)), h.open(this._config.downloadRequestBody ? "POST" : "GET", this._input, !o), this._config.downloadRequestHeaders) {
              var x, E = this._config.downloadRequestHeaders;
              for (x in E) h.setRequestHeader(x, E[x]);
            }
            var D;
            this._config.chunkSize && (D = this._start + this._config.chunkSize - 1, h.setRequestHeader("Range", "bytes=" + this._start + "-" + D));
            try {
              h.send(this._config.downloadRequestBody);
            } catch (W) {
              this._chunkError(W.message);
            }
            o && h.status === 0 && this._chunkError();
          }
        }, this._chunkLoaded = function() {
          h.readyState === 4 && (h.status < 200 || 400 <= h.status ? this._chunkError() : (this._start += this._config.chunkSize || h.responseText.length, this._finished = !this._config.chunkSize || this._start >= ((x) => (x = x.getResponseHeader("Content-Range")) !== null ? parseInt(x.substring(x.lastIndexOf("/") + 1)) : -1)(h), this.parseChunk(h.responseText)));
        }, this._chunkError = function(x) {
          x = h.statusText || x, this._sendError(new Error(x));
        };
      }
      function d(f) {
        (f = f || {}).chunkSize || (f.chunkSize = u.LocalChunkSize), c.call(this, f);
        var h, x, E = typeof FileReader < "u";
        this.stream = function(D) {
          this._input = D, x = D.slice || D.webkitSlice || D.mozSlice, E ? ((h = new FileReader()).onload = A(this._chunkLoaded, this), h.onerror = A(this._chunkError, this)) : h = new FileReaderSync(), this._nextChunk();
        }, this._nextChunk = function() {
          this._finished || this._config.preview && !(this._rowCount < this._config.preview) || this._readChunk();
        }, this._readChunk = function() {
          var D = this._input, W = (this._config.chunkSize && (W = Math.min(this._start + this._config.chunkSize, this._input.size), D = x.call(D, this._start, W)), h.readAsText(D, this._config.encoding));
          E || this._chunkLoaded({ target: { result: W } });
        }, this._chunkLoaded = function(D) {
          this._start += this._config.chunkSize, this._finished = !this._config.chunkSize || this._start >= this._input.size, this.parseChunk(D.target.result);
        }, this._chunkError = function() {
          this._sendError(h.error);
        };
      }
      function v(f) {
        var h;
        c.call(this, f = f || {}), this.stream = function(x) {
          return h = x, this._nextChunk();
        }, this._nextChunk = function() {
          var x, E;
          if (!this._finished) return x = this._config.chunkSize, h = x ? (E = h.substring(0, x), h.substring(x)) : (E = h, ""), this._finished = !h, this.parseChunk(E);
        };
      }
      function L(f) {
        c.call(this, f = f || {});
        var h = [], x = !0, E = !1;
        this.pause = function() {
          c.prototype.pause.apply(this, arguments), this._input.pause();
        }, this.resume = function() {
          c.prototype.resume.apply(this, arguments), this._input.resume();
        }, this.stream = function(D) {
          this._input = D, this._input.on("data", this._streamData), this._input.on("end", this._streamEnd), this._input.on("error", this._streamError);
        }, this._checkIsFinished = function() {
          E && h.length === 1 && (this._finished = !0);
        }, this._nextChunk = function() {
          this._checkIsFinished(), h.length ? this.parseChunk(h.shift()) : x = !0;
        }, this._streamData = A(function(D) {
          try {
            h.push(typeof D == "string" ? D : D.toString(this._config.encoding)), x && (x = !1, this._checkIsFinished(), this.parseChunk(h.shift()));
          } catch (W) {
            this._streamError(W);
          }
        }, this), this._streamError = A(function(D) {
          this._streamCleanUp(), this._sendError(D);
        }, this), this._streamEnd = A(function() {
          this._streamCleanUp(), E = !0, this._streamData("");
        }, this), this._streamCleanUp = A(function() {
          this._input.removeListener("data", this._streamData), this._input.removeListener("end", this._streamEnd), this._input.removeListener("error", this._streamError);
        }, this);
      }
      function $(f) {
        var h, x, E, D, W = Math.pow(2, 53), p = -W, N = /^\s*-?(\d+\.?|\.\d+|\d+\.\d+)([eE][-+]?\d+)?\s*$/, b = /^((\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z)))$/, k = this, U = 0, C = 0, Y = !1, R = !1, I = [], F = { data: [], errors: [], meta: {} };
        function B(_) {
          return f.skipEmptyLines === "greedy" ? _.join("").trim() === "" : _.length === 1 && _[0].length === 0;
        }
        function Q() {
          if (F && E && (T("Delimiter", "UndetectableDelimiter", "Unable to auto-detect delimiting character; defaulted to '" + u.DefaultDelimiter + "'"), E = !1), f.skipEmptyLines && (F.data = F.data.filter(function(w) {
            return !B(w);
          })), J()) {
            let w = function(m, P) {
              z(f.transformHeader) && (m = f.transformHeader(m, P)), I.push(m);
            };
            if (F) if (Array.isArray(F.data[0])) {
              for (var _ = 0; J() && _ < F.data.length; _++) F.data[_].forEach(w);
              F.data.splice(0, 1);
            } else F.data.forEach(w);
          }
          function y(w, m) {
            for (var P = f.header ? {} : [], O = 0; O < w.length; O++) {
              var V = O, q = w[O], q = ((nt, X) => ((et) => (f.dynamicTypingFunction && f.dynamicTyping[et] === void 0 && (f.dynamicTyping[et] = f.dynamicTypingFunction(et)), (f.dynamicTyping[et] || f.dynamicTyping) === !0))(nt) ? X === "true" || X === "TRUE" || X !== "false" && X !== "FALSE" && (((et) => {
                if (N.test(et) && (et = parseFloat(et), p < et && et < W))
                  return 1;
              })(X) ? parseFloat(X) : b.test(X) ? new Date(X) : X === "" ? null : X) : X)(V = f.header ? O >= I.length ? "__parsed_extra" : I[O] : V, q = f.transform ? f.transform(q, V) : q);
              V === "__parsed_extra" ? (P[V] = P[V] || [], P[V].push(q)) : P[V] = q;
            }
            return f.header && (O > I.length ? T("FieldMismatch", "TooManyFields", "Too many fields: expected " + I.length + " fields but parsed " + O, C + m) : O < I.length && T("FieldMismatch", "TooFewFields", "Too few fields: expected " + I.length + " fields but parsed " + O, C + m)), P;
          }
          var M;
          F && (f.header || f.dynamicTyping || f.transform) && (M = 1, !F.data.length || Array.isArray(F.data[0]) ? (F.data = F.data.map(y), M = F.data.length) : F.data = y(F.data, 0), f.header && F.meta && (F.meta.fields = I), C += M);
        }
        function J() {
          return f.header && I.length === 0;
        }
        function T(_, y, M, w) {
          _ = { type: _, code: y, message: M }, w !== void 0 && (_.row = w), F.errors.push(_);
        }
        z(f.step) && (D = f.step, f.step = function(_) {
          F = _, J() ? Q() : (Q(), F.data.length !== 0 && (U += _.data.length, f.preview && U > f.preview ? x.abort() : (F.data = F.data[0], D(F, k))));
        }), this.parse = function(_, y, M) {
          var w = f.quoteChar || '"', w = (f.newline || (f.newline = this.guessLineEndings(_, w)), E = !1, f.delimiter ? z(f.delimiter) && (f.delimiter = f.delimiter(_), F.meta.delimiter = f.delimiter) : ((w = ((m, P, O, V, q) => {
            var nt, X, et, gt;
            q = q || [",", "	", "|", ";", u.RECORD_SEP, u.UNIT_SEP];
            for (var mt = 0; mt < q.length; mt++) {
              for (var yt, Jt = q[mt], at = 0, vt = 0, it = 0, st = (et = void 0, new S({ comments: V, delimiter: Jt, newline: P, preview: 10 }).parse(m)), bt = 0; bt < st.data.length; bt++) O && B(st.data[bt]) ? it++ : (yt = st.data[bt].length, vt += yt, et === void 0 ? et = yt : 0 < yt && (at += Math.abs(yt - et), et = yt));
              0 < st.data.length && (vt /= st.data.length - it), (X === void 0 || at <= X) && (gt === void 0 || gt < vt) && 1.99 < vt && (X = at, nt = Jt, gt = vt);
            }
            return { successful: !!(f.delimiter = nt), bestDelimiter: nt };
          })(_, f.newline, f.skipEmptyLines, f.comments, f.delimitersToGuess)).successful ? f.delimiter = w.bestDelimiter : (E = !0, f.delimiter = u.DefaultDelimiter), F.meta.delimiter = f.delimiter), K(f));
          return f.preview && f.header && w.preview++, h = _, x = new S(w), F = x.parse(h, y, M), Q(), Y ? { meta: { paused: !0 } } : F || { meta: { paused: !1 } };
        }, this.paused = function() {
          return Y;
        }, this.pause = function() {
          Y = !0, x.abort(), h = z(f.chunk) ? "" : h.substring(x.getCharIndex());
        }, this.resume = function() {
          k.streamer._halted ? (Y = !1, k.streamer.parseChunk(h, !0)) : setTimeout(k.resume, 3);
        }, this.aborted = function() {
          return R;
        }, this.abort = function() {
          R = !0, x.abort(), F.meta.aborted = !0, z(f.complete) && f.complete(F), h = "";
        }, this.guessLineEndings = function(m, w) {
          m = m.substring(0, 1048576);
          var w = new RegExp(G(w) + "([^]*?)" + G(w), "gm"), M = (m = m.replace(w, "")).split("\r"), w = m.split(`
`), m = 1 < w.length && w[0].length < M[0].length;
          if (M.length === 1 || m) return `
`;
          for (var P = 0, O = 0; O < M.length; O++) M[O][0] === `
` && P++;
          return P >= M.length / 2 ? `\r
` : "\r";
        };
      }
      function G(f) {
        return f.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      }
      function S(f) {
        var h = (f = f || {}).delimiter, x = f.newline, E = f.comments, D = f.step, W = f.preview, p = f.fastMode, N = null, b = !1, k = f.quoteChar == null ? '"' : f.quoteChar, U = k;
        if (f.escapeChar !== void 0 && (U = f.escapeChar), (typeof h != "string" || -1 < u.BAD_DELIMITERS.indexOf(h)) && (h = ","), E === h) throw new Error("Comment character same as delimiter");
        E === !0 ? E = "#" : (typeof E != "string" || -1 < u.BAD_DELIMITERS.indexOf(E)) && (E = !1), x !== `
` && x !== "\r" && x !== `\r
` && (x = `
`);
        var C = 0, Y = !1;
        this.parse = function(R, I, F) {
          if (typeof R != "string") throw new Error("Input must be a string");
          var B = R.length, Q = h.length, J = x.length, T = E.length, _ = z(D), y = [], M = [], w = [], m = C = 0;
          if (!R) return at();
          if (p || p !== !1 && R.indexOf(k) === -1) {
            for (var P = R.split(x), O = 0; O < P.length; O++) {
              if (w = P[O], C += w.length, O !== P.length - 1) C += x.length;
              else if (F) return at();
              if (!E || w.substring(0, T) !== E) {
                if (_) {
                  if (y = [], gt(w.split(h)), vt(), Y) return at();
                } else gt(w.split(h));
                if (W && W <= O) return y = y.slice(0, W), at(!0);
              }
            }
            return at();
          }
          for (var V = R.indexOf(h, C), q = R.indexOf(x, C), nt = new RegExp(G(U) + G(k), "g"), X = R.indexOf(k, C); ; ) if (R[C] === k) for (X = C, C++; ; ) {
            if ((X = R.indexOf(k, X + 1)) === -1) return F || M.push({ type: "Quotes", code: "MissingQuotes", message: "Quoted field unterminated", row: y.length, index: C }), yt();
            if (X === B - 1) return yt(R.substring(C, X).replace(nt, k));
            if (k === U && R[X + 1] === U) X++;
            else if (k === U || X === 0 || R[X - 1] !== U) {
              V !== -1 && V < X + 1 && (V = R.indexOf(h, X + 1));
              var et = mt((q = q !== -1 && q < X + 1 ? R.indexOf(x, X + 1) : q) === -1 ? V : Math.min(V, q));
              if (R.substr(X + 1 + et, Q) === h) {
                w.push(R.substring(C, X).replace(nt, k)), R[C = X + 1 + et + Q] !== k && (X = R.indexOf(k, C)), V = R.indexOf(h, C), q = R.indexOf(x, C);
                break;
              }
              if (et = mt(q), R.substring(X + 1 + et, X + 1 + et + J) === x) {
                if (w.push(R.substring(C, X).replace(nt, k)), Jt(X + 1 + et + J), V = R.indexOf(h, C), X = R.indexOf(k, C), _ && (vt(), Y)) return at();
                if (W && y.length >= W) return at(!0);
                break;
              }
              M.push({ type: "Quotes", code: "InvalidQuotes", message: "Trailing quote on quoted field is malformed", row: y.length, index: C }), X++;
            }
          }
          else if (E && w.length === 0 && R.substring(C, C + T) === E) {
            if (q === -1) return at();
            C = q + J, q = R.indexOf(x, C), V = R.indexOf(h, C);
          } else if (V !== -1 && (V < q || q === -1)) w.push(R.substring(C, V)), C = V + Q, V = R.indexOf(h, C);
          else {
            if (q === -1) break;
            if (w.push(R.substring(C, q)), Jt(q + J), _ && (vt(), Y)) return at();
            if (W && y.length >= W) return at(!0);
          }
          return yt();
          function gt(it) {
            y.push(it), m = C;
          }
          function mt(it) {
            var st = 0;
            return st = it !== -1 && (it = R.substring(X + 1, it)) && it.trim() === "" ? it.length : st;
          }
          function yt(it) {
            return F || (it === void 0 && (it = R.substring(C)), w.push(it), C = B, gt(w), _ && vt()), at();
          }
          function Jt(it) {
            C = it, gt(w), w = [], q = R.indexOf(x, C);
          }
          function at(it) {
            if (f.header && !I && y.length && !b) {
              var st = y[0], bt = /* @__PURE__ */ Object.create(null), $e = new Set(st);
              let Mn = !1;
              for (let Ht = 0; Ht < st.length; Ht++) {
                let _t = st[Ht];
                if (bt[_t = z(f.transformHeader) ? f.transformHeader(_t, Ht) : _t]) {
                  let jt, Cn = bt[_t];
                  for (; jt = _t + "_" + Cn, Cn++, $e.has(jt); ) ;
                  $e.add(jt), st[Ht] = jt, bt[_t]++, Mn = !0, (N = N === null ? {} : N)[jt] = _t;
                } else bt[_t] = 1, st[Ht] = _t;
                $e.add(_t);
              }
              Mn && console.warn("Duplicate headers found and renamed."), b = !0;
            }
            return { data: y, errors: M, meta: { delimiter: h, linebreak: x, aborted: Y, truncated: !!it, cursor: m + (I || 0), renamedHeaders: N } };
          }
          function vt() {
            D(at()), y = [], M = [];
          }
        }, this.abort = function() {
          Y = !0;
        }, this.getCharIndex = function() {
          return C;
        };
      }
      function tt(f) {
        var h = f.data, x = s[h.workerId], E = !1;
        if (h.error) x.userError(h.error, h.file);
        else if (h.results && h.results.data) {
          var D = { abort: function() {
            E = !0, Z(h.workerId, { data: [], errors: [], meta: { aborted: !0 } });
          }, pause: H, resume: H };
          if (z(x.userStep)) {
            for (var W = 0; W < h.results.data.length && (x.userStep({ data: h.results.data[W], errors: h.results.errors, meta: h.results.meta }, D), !E); W++) ;
            delete h.results;
          } else z(x.userChunk) && (x.userChunk(h.results, D, h.file), delete h.results);
        }
        h.finished && !E && Z(h.workerId, h.results);
      }
      function Z(f, h) {
        var x = s[f];
        z(x.userComplete) && x.userComplete(h), x.terminate(), delete s[f];
      }
      function H() {
        throw new Error("Not implemented.");
      }
      function K(f) {
        if (typeof f != "object" || f === null) return f;
        var h, x = Array.isArray(f) ? [] : {};
        for (h in f) x[h] = K(f[h]);
        return x;
      }
      function A(f, h) {
        return function() {
          f.apply(h, arguments);
        };
      }
      function z(f) {
        return typeof f == "function";
      }
      return u.parse = function(f, h) {
        var x = (h = h || {}).dynamicTyping || !1;
        if (z(x) && (h.dynamicTypingFunction = x, x = {}), h.dynamicTyping = x, h.transform = !!z(h.transform) && h.transform, !h.worker || !u.WORKERS_SUPPORTED) return x = null, u.NODE_STREAM_INPUT, typeof f == "string" ? (f = ((E) => E.charCodeAt(0) !== 65279 ? E : E.slice(1))(f), x = new (h.download ? g : v)(h)) : f.readable === !0 && z(f.read) && z(f.on) ? x = new L(h) : (r.File && f instanceof File || f instanceof Object) && (x = new d(h)), x.stream(f);
        (x = (() => {
          var E;
          return !!u.WORKERS_SUPPORTED && (E = (() => {
            var D = r.URL || r.webkitURL || null, W = n.toString();
            return u.BLOB_URL || (u.BLOB_URL = D.createObjectURL(new Blob(["var global = (function() { if (typeof self !== 'undefined') { return self; } if (typeof window !== 'undefined') { return window; } if (typeof global !== 'undefined') { return global; } return {}; })(); global.IS_PAPA_WORKER=true; ", "(", W, ")();"], { type: "text/javascript" })));
          })(), (E = new r.Worker(E)).onmessage = tt, E.id = l++, s[E.id] = E);
        })()).userStep = h.step, x.userChunk = h.chunk, x.userComplete = h.complete, x.userError = h.error, h.step = z(h.step), h.chunk = z(h.chunk), h.complete = z(h.complete), h.error = z(h.error), delete h.worker, x.postMessage({ input: f, config: h, workerId: x.id });
      }, u.unparse = function(f, h) {
        var x = !1, E = !0, D = ",", W = `\r
`, p = '"', N = p + p, b = !1, k = null, U = !1, C = ((() => {
          if (typeof h == "object") {
            if (typeof h.delimiter != "string" || u.BAD_DELIMITERS.filter(function(I) {
              return h.delimiter.indexOf(I) !== -1;
            }).length || (D = h.delimiter), typeof h.quotes != "boolean" && typeof h.quotes != "function" && !Array.isArray(h.quotes) || (x = h.quotes), typeof h.skipEmptyLines != "boolean" && typeof h.skipEmptyLines != "string" || (b = h.skipEmptyLines), typeof h.newline == "string" && (W = h.newline), typeof h.quoteChar == "string" && (p = h.quoteChar), typeof h.header == "boolean" && (E = h.header), Array.isArray(h.columns)) {
              if (h.columns.length === 0) throw new Error("Option columns is empty");
              k = h.columns;
            }
            h.escapeChar !== void 0 && (N = h.escapeChar + p), h.escapeFormulae instanceof RegExp ? U = h.escapeFormulae : typeof h.escapeFormulae == "boolean" && h.escapeFormulae && (U = /^[=+\-@\t\r].*$/);
          }
        })(), new RegExp(G(p), "g"));
        if (typeof f == "string" && (f = JSON.parse(f)), Array.isArray(f)) {
          if (!f.length || Array.isArray(f[0])) return Y(null, f, b);
          if (typeof f[0] == "object") return Y(k || Object.keys(f[0]), f, b);
        } else if (typeof f == "object") return typeof f.data == "string" && (f.data = JSON.parse(f.data)), Array.isArray(f.data) && (f.fields || (f.fields = f.meta && f.meta.fields || k), f.fields || (f.fields = Array.isArray(f.data[0]) ? f.fields : typeof f.data[0] == "object" ? Object.keys(f.data[0]) : []), Array.isArray(f.data[0]) || typeof f.data[0] == "object" || (f.data = [f.data])), Y(f.fields || [], f.data || [], b);
        throw new Error("Unable to serialize unrecognized input");
        function Y(I, F, B) {
          var Q = "", J = (typeof I == "string" && (I = JSON.parse(I)), typeof F == "string" && (F = JSON.parse(F)), Array.isArray(I) && 0 < I.length), T = !Array.isArray(F[0]);
          if (J && E) {
            for (var _ = 0; _ < I.length; _++) 0 < _ && (Q += D), Q += R(I[_], _);
            0 < F.length && (Q += W);
          }
          for (var y = 0; y < F.length; y++) {
            var M = (J ? I : F[y]).length, w = !1, m = J ? Object.keys(F[y]).length === 0 : F[y].length === 0;
            if (B && !J && (w = B === "greedy" ? F[y].join("").trim() === "" : F[y].length === 1 && F[y][0].length === 0), B === "greedy" && J) {
              for (var P = [], O = 0; O < M; O++) {
                var V = T ? I[O] : O;
                P.push(F[y][V]);
              }
              w = P.join("").trim() === "";
            }
            if (!w) {
              for (var q = 0; q < M; q++) {
                0 < q && !m && (Q += D);
                var nt = J && T ? I[q] : q;
                Q += R(F[y][nt], q);
              }
              y < F.length - 1 && (!B || 0 < M && !m) && (Q += W);
            }
          }
          return Q;
        }
        function R(I, F) {
          var B, Q;
          return I == null ? "" : I.constructor === Date ? JSON.stringify(I).slice(1, 25) : (Q = !1, U && typeof I == "string" && U.test(I) && (I = "'" + I, Q = !0), B = I.toString().replace(C, N), (Q = Q || x === !0 || typeof x == "function" && x(I, F) || Array.isArray(x) && x[F] || ((J, T) => {
            for (var _ = 0; _ < T.length; _++) if (-1 < J.indexOf(T[_])) return !0;
            return !1;
          })(B, u.BAD_DELIMITERS) || -1 < B.indexOf(D) || B.charAt(0) === " " || B.charAt(B.length - 1) === " ") ? p + B + p : B);
        }
      }, u.RECORD_SEP = "", u.UNIT_SEP = "", u.BYTE_ORDER_MARK = "\uFEFF", u.BAD_DELIMITERS = ["\r", `
`, '"', u.BYTE_ORDER_MARK], u.WORKERS_SUPPORTED = !o && !!r.Worker, u.NODE_STREAM_INPUT = 1, u.LocalChunkSize = 10485760, u.RemoteChunkSize = 5242880, u.DefaultDelimiter = ",", u.Parser = S, u.ParserHandle = $, u.NetworkStreamer = g, u.FileStreamer = d, u.StringStreamer = v, u.ReadableStreamStreamer = L, r.jQuery && ((i = r.jQuery).fn.parse = function(f) {
        var h = f.config || {}, x = [];
        return this.each(function(W) {
          if (!(i(this).prop("tagName").toUpperCase() === "INPUT" && i(this).attr("type").toLowerCase() === "file" && r.FileReader) || !this.files || this.files.length === 0) return !0;
          for (var p = 0; p < this.files.length; p++) x.push({ file: this.files[p], inputElem: this, instanceConfig: i.extend({}, h) });
        }), E(), this;
        function E() {
          if (x.length === 0) z(f.complete) && f.complete();
          else {
            var W, p, N, b, k = x[0];
            if (z(f.before)) {
              var U = f.before(k.file, k.inputElem);
              if (typeof U == "object") {
                if (U.action === "abort") return W = "AbortError", p = k.file, N = k.inputElem, b = U.reason, void (z(f.error) && f.error({ name: W }, p, N, b));
                if (U.action === "skip") return void D();
                typeof U.config == "object" && (k.instanceConfig = i.extend(k.instanceConfig, U.config));
              } else if (U === "skip") return void D();
            }
            var C = k.instanceConfig.complete;
            k.instanceConfig.complete = function(Y) {
              z(C) && C(Y, k.file, k.inputElem), D();
            }, u.parse(k.file, k.instanceConfig);
          }
        }
        function D() {
          x.splice(0, 1), E();
        }
      }), a && (r.onmessage = function(f) {
        f = f.data, u.WORKER_ID === void 0 && f && (u.WORKER_ID = f.workerId), typeof f.input == "string" ? r.postMessage({ workerId: u.WORKER_ID, results: u.parse(f.input, f.config), finished: !0 }) : (r.File && f.input instanceof File || f.input instanceof Object) && (f = u.parse(f.input, f.config)) && r.postMessage({ workerId: u.WORKER_ID, results: f, finished: !0 });
      }), (g.prototype = Object.create(c.prototype)).constructor = g, (d.prototype = Object.create(c.prototype)).constructor = d, (v.prototype = Object.create(v.prototype)).constructor = v, (L.prototype = Object.create(c.prototype)).constructor = L, u;
    });
  }(ve)), ve.exports;
}
var ti = jr();
const ei = /* @__PURE__ */ Qr(ti);
function Yt(t) {
  const e = Number(t);
  return Number.isFinite(e) ? e : void 0;
}
class ni {
  static parse(e) {
    return ei.parse(e, { header: !0, skipEmptyLines: !0 }).data.map((r) => {
      let i;
      const o = (r.labelKind ?? "").trim().toLowerCase();
      if (o === "text" ? i = { kind: "text", text: r.labelText } : o === "image" ? i = {
        kind: "image",
        src: r.labelSrc || "",
        width: Yt(r.labelWidth),
        height: Yt(r.labelHeight),
        fit: r.labelFit || void 0,
        zoom: Yt(r.labelZoom)
      } : o === "video" && (i = {
        kind: "video",
        src: r.labelSrc || "",
        width: Yt(r.labelWidth),
        height: Yt(r.labelHeight),
        fit: r.labelFit || void 0,
        zoom: Yt(r.labelZoom)
      }), !i && r.backgroundType) {
        const s = r.backgroundType.trim().toLowerCase();
        s === "image" && r.backgroundSource ? i = { kind: "image", src: r.backgroundSource } : s === "video" && r.backgroundSource ? i = { kind: "video", src: r.backgroundSource } : s === "text" && (i = { kind: "text", text: r.description || r.title });
      }
      let a;
      if (r.metadata)
        try {
          a = JSON.parse(r.metadata);
        } catch {
        }
      return {
        title: r.title,
        start: new Date(r.start),
        end: r.end ? new Date(r.end) : void 0,
        description: r.description,
        overlayColor: r.overlayColor ?? r.overlayColor ?? void 0,
        label: i,
        metadata: a
      };
    });
  }
}
class ri {
  static parse(e) {
    return (typeof e == "string" ? JSON.parse(e) : e).items.map((r) => {
      let i = r.label;
      if (!i && r.background) {
        const o = (r.background.type ?? "").toLowerCase();
        o === "image" && r.background.source ? i = { kind: "image", src: r.background.source } : o === "video" && r.background.source ? i = { kind: "video", src: r.background.source } : o === "text" && (i = { kind: "text", text: r.description ?? r.title });
      }
      return {
        title: r.title,
        start: new Date(r.start),
        end: r.end ? new Date(r.end) : void 0,
        description: r.description,
        overlayColor: r.overlayColor ?? r.background?.overlayColor,
        label: i,
        metadata: r.metadata
      };
    });
  }
}
class ii {
  static parse(e) {
    const r = new DOMParser().parseFromString(e, "application/xml"), i = [];
    return r.querySelectorAll("item").forEach((o) => {
      const a = (c) => o.querySelector(c)?.textContent?.trim() || "", s = o.querySelector("label");
      let l;
      if (s) {
        const c = (s.getAttribute("kind") || "").toLowerCase();
        c === "text" ? l = { kind: "text", text: s.textContent?.trim() || void 0 } : c === "image" ? l = {
          kind: "image",
          src: s.getAttribute("src") || "",
          width: s.getAttribute("width") ? Number(s.getAttribute("width")) : void 0,
          height: s.getAttribute("height") ? Number(s.getAttribute("height")) : void 0,
          fit: s.getAttribute("fit") || void 0,
          zoom: s.getAttribute("zoom") ? Number(s.getAttribute("zoom")) : void 0
        } : c === "video" && (l = {
          kind: "video",
          src: s.getAttribute("src") || "",
          width: s.getAttribute("width") ? Number(s.getAttribute("width")) : void 0,
          height: s.getAttribute("height") ? Number(s.getAttribute("height")) : void 0,
          fit: s.getAttribute("fit") || void 0,
          zoom: s.getAttribute("zoom") ? Number(s.getAttribute("zoom")) : void 0
        });
      }
      const u = a("overlayColor") || s?.getAttribute("overlayColor") || void 0;
      i.push({
        title: a("title"),
        start: new Date(a("start")),
        end: o.querySelector("end") ? new Date(a("end")) : void 0,
        description: a("description"),
        overlayColor: u,
        label: l
      });
    }), i;
  }
}
class oi {
  static parse(e) {
    const r = new DOMParser().parseFromString(e, "application/xml"), i = [];
    return r.querySelectorAll("listEvent event").forEach((o) => {
      const a = (g) => o.querySelector(g)?.textContent?.trim() || "", s = o.getAttribute("when") || o.querySelector("date")?.getAttribute("when") || "", l = s ? new Date(s) : new Date(a("date"));
      let u;
      const c = o.querySelector("label");
      if (c) {
        const g = (c.getAttribute("kind") || "").toLowerCase();
        g === "text" ? u = { kind: "text", text: c.textContent?.trim() || void 0 } : g === "image" ? u = { kind: "image", src: c.getAttribute("src") || "" } : g === "video" && (u = { kind: "video", src: c.getAttribute("src") || "" });
      } else {
        const g = a("title") || a("desc");
        g && (u = { kind: "text", text: g });
      }
      i.push({
        title: a("title") || a("desc"),
        start: l,
        description: a("desc"),
        label: u,
        metadata: {
          when: s || void 0,
          type: o.getAttribute("type") || void 0
        }
      });
    }), i;
  }
}
const Le = /* @__PURE__ */ new Map();
class Nt {
  static register(e) {
    Le.set(e.name.toLowerCase(), e);
  }
  static supportedFormats() {
    return Array.from(/* @__PURE__ */ new Set(["csv", "json", "xml", "tei", ...Le.keys()]));
  }
  static parse(e, n) {
    const r = Le.get(String(n).toLowerCase());
    if (r) return r.parse(e);
    switch (n) {
      case "csv":
        return ni.parse(e);
      case "json":
        return ri.parse(e);
      case "xml":
        return ii.parse(e);
      case "tei":
        return oi.parse(e);
      default:
        throw new Error(`Unsupported data type: ${n}`);
    }
  }
}
function _e(t, e) {
  return t == null || e == null ? NaN : t < e ? -1 : t > e ? 1 : t >= e ? 0 : NaN;
}
function ai(t, e) {
  return t == null || e == null ? NaN : e < t ? -1 : e > t ? 1 : e >= t ? 0 : NaN;
}
function un(t) {
  let e, n, r;
  t.length !== 2 ? (e = _e, n = (s, l) => _e(t(s), l), r = (s, l) => t(s) - l) : (e = t === _e || t === ai ? t : si, n = t, r = t);
  function i(s, l, u = 0, c = s.length) {
    if (u < c) {
      if (e(l, l) !== 0) return c;
      do {
        const g = u + c >>> 1;
        n(s[g], l) < 0 ? u = g + 1 : c = g;
      } while (u < c);
    }
    return u;
  }
  function o(s, l, u = 0, c = s.length) {
    if (u < c) {
      if (e(l, l) !== 0) return c;
      do {
        const g = u + c >>> 1;
        n(s[g], l) <= 0 ? u = g + 1 : c = g;
      } while (u < c);
    }
    return u;
  }
  function a(s, l, u = 0, c = s.length) {
    const g = i(s, l, u, c - 1);
    return g > u && r(s[g - 1], l) > -r(s[g], l) ? g - 1 : g;
  }
  return { left: i, center: a, right: o };
}
function si() {
  return 0;
}
function ui(t) {
  return t === null ? NaN : +t;
}
const li = un(_e), ci = li.right;
un(ui).center;
function hr(t, e) {
  let n, r;
  for (const i of t)
    i != null && (n === void 0 ? i >= i && (n = r = i) : (n > i && (n = i), r < i && (r = i)));
  return [n, r];
}
class Sn extends Map {
  constructor(e, n = di) {
    if (super(), Object.defineProperties(this, { _intern: { value: /* @__PURE__ */ new Map() }, _key: { value: n } }), e != null) for (const [r, i] of e) this.set(r, i);
  }
  get(e) {
    return super.get(An(this, e));
  }
  has(e) {
    return super.has(An(this, e));
  }
  set(e, n) {
    return super.set(fi(this, e), n);
  }
  delete(e) {
    return super.delete(hi(this, e));
  }
}
function An({ _intern: t, _key: e }, n) {
  const r = e(n);
  return t.has(r) ? t.get(r) : n;
}
function fi({ _intern: t, _key: e }, n) {
  const r = e(n);
  return t.has(r) ? t.get(r) : (t.set(r, n), n);
}
function hi({ _intern: t, _key: e }, n) {
  const r = e(n);
  return t.has(r) && (n = t.get(r), t.delete(r)), n;
}
function di(t) {
  return t !== null && typeof t == "object" ? t.valueOf() : t;
}
const pi = Math.sqrt(50), gi = Math.sqrt(10), mi = Math.sqrt(2);
function dr(t, e, n) {
  const r = (e - t) / Math.max(0, n), i = Math.floor(Math.log10(r)), o = r / Math.pow(10, i), a = o >= pi ? 10 : o >= gi ? 5 : o >= mi ? 2 : 1;
  let s, l, u;
  return i < 0 ? (u = Math.pow(10, -i) / a, s = Math.round(t * u), l = Math.round(e * u), s / u < t && ++s, l / u > e && --l, u = -u) : (u = Math.pow(10, i) * a, s = Math.round(t / u), l = Math.round(e / u), s * u < t && ++s, l * u > e && --l), l < s && 0.5 <= n && n < 2 ? dr(t, e, n * 2) : [s, l, u];
}
function En(t, e, n) {
  return e = +e, t = +t, n = +n, dr(t, e, n)[2];
}
function Dn(t, e, n) {
  e = +e, t = +t, n = +n;
  const r = e < t, i = r ? En(e, t, n) : En(t, e, n);
  return (r ? -1 : 1) * (i < 0 ? 1 / -i : i);
}
function yi(t, e, n) {
  t = +t, e = +e, n = (i = arguments.length) < 2 ? (e = t, t = 0, 1) : i < 3 ? 1 : +n;
  for (var r = -1, i = Math.max(0, Math.ceil((e - t) / n)) | 0, o = new Array(i); ++r < i; )
    o[r] = t + r * n;
  return o;
}
function vi(t) {
  return t;
}
var He = 1, Ye = 2, Ke = 3, oe = 4, Nn = 1e-6;
function _i(t) {
  return "translate(" + t + ",0)";
}
function xi(t) {
  return "translate(0," + t + ")";
}
function wi(t) {
  return (e) => +t(e);
}
function bi(t, e) {
  return e = Math.max(0, t.bandwidth() - e * 2) / 2, t.round() && (e = Math.round(e)), (n) => +t(n) + e;
}
function ki() {
  return !this.__axis;
}
function pr(t, e) {
  var n = [], r = null, i = null, o = 6, a = 6, s = 3, l = typeof window < "u" && window.devicePixelRatio > 1 ? 0 : 0.5, u = t === He || t === oe ? -1 : 1, c = t === oe || t === Ye ? "x" : "y", g = t === He || t === Ke ? _i : xi;
  function d(v) {
    var L = r ?? (e.ticks ? e.ticks.apply(e, n) : e.domain()), $ = i ?? (e.tickFormat ? e.tickFormat.apply(e, n) : vi), G = Math.max(o, 0) + s, S = e.range(), tt = +S[0] + l, Z = +S[S.length - 1] + l, H = (e.bandwidth ? bi : wi)(e.copy(), l), K = v.selection ? v.selection() : v, A = K.selectAll(".domain").data([null]), z = K.selectAll(".tick").data(L, e).order(), f = z.exit(), h = z.enter().append("g").attr("class", "tick"), x = z.select("line"), E = z.select("text");
    A = A.merge(A.enter().insert("path", ".tick").attr("class", "domain").attr("stroke", "currentColor")), z = z.merge(h), x = x.merge(h.append("line").attr("stroke", "currentColor").attr(c + "2", u * o)), E = E.merge(h.append("text").attr("fill", "currentColor").attr(c, u * G).attr("dy", t === He ? "0em" : t === Ke ? "0.71em" : "0.32em")), v !== K && (A = A.transition(v), z = z.transition(v), x = x.transition(v), E = E.transition(v), f = f.transition(v).attr("opacity", Nn).attr("transform", function(D) {
      return isFinite(D = H(D)) ? g(D + l) : this.getAttribute("transform");
    }), h.attr("opacity", Nn).attr("transform", function(D) {
      var W = this.parentNode.__axis;
      return g((W && isFinite(W = W(D)) ? W : H(D)) + l);
    })), f.remove(), A.attr("d", t === oe || t === Ye ? a ? "M" + u * a + "," + tt + "H" + l + "V" + Z + "H" + u * a : "M" + l + "," + tt + "V" + Z : a ? "M" + tt + "," + u * a + "V" + l + "H" + Z + "V" + u * a : "M" + tt + "," + l + "H" + Z), z.attr("opacity", 1).attr("transform", function(D) {
      return g(H(D) + l);
    }), x.attr(c + "2", u * o), E.attr(c, u * G).text($), K.filter(ki).attr("fill", "none").attr("font-size", 10).attr("font-family", "sans-serif").attr("text-anchor", t === Ye ? "start" : t === oe ? "end" : "middle"), K.each(function() {
      this.__axis = H;
    });
  }
  return d.scale = function(v) {
    return arguments.length ? (e = v, d) : e;
  }, d.ticks = function() {
    return n = Array.from(arguments), d;
  }, d.tickArguments = function(v) {
    return arguments.length ? (n = v == null ? [] : Array.from(v), d) : n.slice();
  }, d.tickValues = function(v) {
    return arguments.length ? (r = v == null ? null : Array.from(v), d) : r && r.slice();
  }, d.tickFormat = function(v) {
    return arguments.length ? (i = v, d) : i;
  }, d.tickSize = function(v) {
    return arguments.length ? (o = a = +v, d) : o;
  }, d.tickSizeInner = function(v) {
    return arguments.length ? (o = +v, d) : o;
  }, d.tickSizeOuter = function(v) {
    return arguments.length ? (a = +v, d) : a;
  }, d.tickPadding = function(v) {
    return arguments.length ? (s = +v, d) : s;
  }, d.offset = function(v) {
    return arguments.length ? (l = +v, d) : l;
  }, d;
}
function Rn(t) {
  return pr(Ke, t);
}
function Fn(t) {
  return pr(oe, t);
}
var Mi = { value: () => {
} };
function ln() {
  for (var t = 0, e = arguments.length, n = {}, r; t < e; ++t) {
    if (!(r = arguments[t] + "") || r in n || /[\s.]/.test(r)) throw new Error("illegal type: " + r);
    n[r] = [];
  }
  return new xe(n);
}
function xe(t) {
  this._ = t;
}
function Ci(t, e) {
  return t.trim().split(/^|\s+/).map(function(n) {
    var r = "", i = n.indexOf(".");
    if (i >= 0 && (r = n.slice(i + 1), n = n.slice(0, i)), n && !e.hasOwnProperty(n)) throw new Error("unknown type: " + n);
    return { type: n, name: r };
  });
}
xe.prototype = ln.prototype = {
  constructor: xe,
  on: function(t, e) {
    var n = this._, r = Ci(t + "", n), i, o = -1, a = r.length;
    if (arguments.length < 2) {
      for (; ++o < a; ) if ((i = (t = r[o]).type) && (i = Ti(n[i], t.name))) return i;
      return;
    }
    if (e != null && typeof e != "function") throw new Error("invalid callback: " + e);
    for (; ++o < a; )
      if (i = (t = r[o]).type) n[i] = Un(n[i], t.name, e);
      else if (e == null) for (i in n) n[i] = Un(n[i], t.name, null);
    return this;
  },
  copy: function() {
    var t = {}, e = this._;
    for (var n in e) t[n] = e[n].slice();
    return new xe(t);
  },
  call: function(t, e) {
    if ((i = arguments.length - 2) > 0) for (var n = new Array(i), r = 0, i, o; r < i; ++r) n[r] = arguments[r + 2];
    if (!this._.hasOwnProperty(t)) throw new Error("unknown type: " + t);
    for (o = this._[t], r = 0, i = o.length; r < i; ++r) o[r].value.apply(e, n);
  },
  apply: function(t, e, n) {
    if (!this._.hasOwnProperty(t)) throw new Error("unknown type: " + t);
    for (var r = this._[t], i = 0, o = r.length; i < o; ++i) r[i].value.apply(e, n);
  }
};
function Ti(t, e) {
  for (var n = 0, r = t.length, i; n < r; ++n)
    if ((i = t[n]).name === e)
      return i.value;
}
function Un(t, e, n) {
  for (var r = 0, i = t.length; r < i; ++r)
    if (t[r].name === e) {
      t[r] = Mi, t = t.slice(0, r).concat(t.slice(r + 1));
      break;
    }
  return n != null && t.push({ name: e, value: n }), t;
}
var Qe = "http://www.w3.org/1999/xhtml";
const zn = {
  svg: "http://www.w3.org/2000/svg",
  xhtml: Qe,
  xlink: "http://www.w3.org/1999/xlink",
  xml: "http://www.w3.org/XML/1998/namespace",
  xmlns: "http://www.w3.org/2000/xmlns/"
};
function Ue(t) {
  var e = t += "", n = e.indexOf(":");
  return n >= 0 && (e = t.slice(0, n)) !== "xmlns" && (t = t.slice(n + 1)), zn.hasOwnProperty(e) ? { space: zn[e], local: t } : t;
}
function Si(t) {
  return function() {
    var e = this.ownerDocument, n = this.namespaceURI;
    return n === Qe && e.documentElement.namespaceURI === Qe ? e.createElement(t) : e.createElementNS(n, t);
  };
}
function Ai(t) {
  return function() {
    return this.ownerDocument.createElementNS(t.space, t.local);
  };
}
function gr(t) {
  var e = Ue(t);
  return (e.local ? Ai : Si)(e);
}
function Ei() {
}
function cn(t) {
  return t == null ? Ei : function() {
    return this.querySelector(t);
  };
}
function Di(t) {
  typeof t != "function" && (t = cn(t));
  for (var e = this._groups, n = e.length, r = new Array(n), i = 0; i < n; ++i)
    for (var o = e[i], a = o.length, s = r[i] = new Array(a), l, u, c = 0; c < a; ++c)
      (l = o[c]) && (u = t.call(l, l.__data__, c, o)) && ("__data__" in l && (u.__data__ = l.__data__), s[c] = u);
  return new lt(r, this._parents);
}
function Ni(t) {
  return t == null ? [] : Array.isArray(t) ? t : Array.from(t);
}
function Ri() {
  return [];
}
function mr(t) {
  return t == null ? Ri : function() {
    return this.querySelectorAll(t);
  };
}
function Fi(t) {
  return function() {
    return Ni(t.apply(this, arguments));
  };
}
function Ui(t) {
  typeof t == "function" ? t = Fi(t) : t = mr(t);
  for (var e = this._groups, n = e.length, r = [], i = [], o = 0; o < n; ++o)
    for (var a = e[o], s = a.length, l, u = 0; u < s; ++u)
      (l = a[u]) && (r.push(t.call(l, l.__data__, u, a)), i.push(l));
  return new lt(r, i);
}
function yr(t) {
  return function() {
    return this.matches(t);
  };
}
function vr(t) {
  return function(e) {
    return e.matches(t);
  };
}
var zi = Array.prototype.find;
function Ii(t) {
  return function() {
    return zi.call(this.children, t);
  };
}
function Oi() {
  return this.firstElementChild;
}
function $i(t) {
  return this.select(t == null ? Oi : Ii(typeof t == "function" ? t : vr(t)));
}
var Li = Array.prototype.filter;
function Hi() {
  return Array.from(this.children);
}
function Yi(t) {
  return function() {
    return Li.call(this.children, t);
  };
}
function Pi(t) {
  return this.selectAll(t == null ? Hi : Yi(typeof t == "function" ? t : vr(t)));
}
function Wi(t) {
  typeof t != "function" && (t = yr(t));
  for (var e = this._groups, n = e.length, r = new Array(n), i = 0; i < n; ++i)
    for (var o = e[i], a = o.length, s = r[i] = [], l, u = 0; u < a; ++u)
      (l = o[u]) && t.call(l, l.__data__, u, o) && s.push(l);
  return new lt(r, this._parents);
}
function _r(t) {
  return new Array(t.length);
}
function qi() {
  return new lt(this._enter || this._groups.map(_r), this._parents);
}
function Me(t, e) {
  this.ownerDocument = t.ownerDocument, this.namespaceURI = t.namespaceURI, this._next = null, this._parent = t, this.__data__ = e;
}
Me.prototype = {
  constructor: Me,
  appendChild: function(t) {
    return this._parent.insertBefore(t, this._next);
  },
  insertBefore: function(t, e) {
    return this._parent.insertBefore(t, e);
  },
  querySelector: function(t) {
    return this._parent.querySelector(t);
  },
  querySelectorAll: function(t) {
    return this._parent.querySelectorAll(t);
  }
};
function Xi(t) {
  return function() {
    return t;
  };
}
function Vi(t, e, n, r, i, o) {
  for (var a = 0, s, l = e.length, u = o.length; a < u; ++a)
    (s = e[a]) ? (s.__data__ = o[a], r[a] = s) : n[a] = new Me(t, o[a]);
  for (; a < l; ++a)
    (s = e[a]) && (i[a] = s);
}
function Bi(t, e, n, r, i, o, a) {
  var s, l, u = /* @__PURE__ */ new Map(), c = e.length, g = o.length, d = new Array(c), v;
  for (s = 0; s < c; ++s)
    (l = e[s]) && (d[s] = v = a.call(l, l.__data__, s, e) + "", u.has(v) ? i[s] = l : u.set(v, l));
  for (s = 0; s < g; ++s)
    v = a.call(t, o[s], s, o) + "", (l = u.get(v)) ? (r[s] = l, l.__data__ = o[s], u.delete(v)) : n[s] = new Me(t, o[s]);
  for (s = 0; s < c; ++s)
    (l = e[s]) && u.get(d[s]) === l && (i[s] = l);
}
function Gi(t) {
  return t.__data__;
}
function Zi(t, e) {
  if (!arguments.length) return Array.from(this, Gi);
  var n = e ? Bi : Vi, r = this._parents, i = this._groups;
  typeof t != "function" && (t = Xi(t));
  for (var o = i.length, a = new Array(o), s = new Array(o), l = new Array(o), u = 0; u < o; ++u) {
    var c = r[u], g = i[u], d = g.length, v = Ki(t.call(c, c && c.__data__, u, r)), L = v.length, $ = s[u] = new Array(L), G = a[u] = new Array(L), S = l[u] = new Array(d);
    n(c, g, $, G, S, v, e);
    for (var tt = 0, Z = 0, H, K; tt < L; ++tt)
      if (H = $[tt]) {
        for (tt >= Z && (Z = tt + 1); !(K = G[Z]) && ++Z < L; ) ;
        H._next = K || null;
      }
  }
  return a = new lt(a, r), a._enter = s, a._exit = l, a;
}
function Ki(t) {
  return typeof t == "object" && "length" in t ? t : Array.from(t);
}
function Qi() {
  return new lt(this._exit || this._groups.map(_r), this._parents);
}
function Ji(t, e, n) {
  var r = this.enter(), i = this, o = this.exit();
  return typeof t == "function" ? (r = t(r), r && (r = r.selection())) : r = r.append(t + ""), e != null && (i = e(i), i && (i = i.selection())), n == null ? o.remove() : n(o), r && i ? r.merge(i).order() : i;
}
function ji(t) {
  for (var e = t.selection ? t.selection() : t, n = this._groups, r = e._groups, i = n.length, o = r.length, a = Math.min(i, o), s = new Array(i), l = 0; l < a; ++l)
    for (var u = n[l], c = r[l], g = u.length, d = s[l] = new Array(g), v, L = 0; L < g; ++L)
      (v = u[L] || c[L]) && (d[L] = v);
  for (; l < i; ++l)
    s[l] = n[l];
  return new lt(s, this._parents);
}
function to() {
  for (var t = this._groups, e = -1, n = t.length; ++e < n; )
    for (var r = t[e], i = r.length - 1, o = r[i], a; --i >= 0; )
      (a = r[i]) && (o && a.compareDocumentPosition(o) ^ 4 && o.parentNode.insertBefore(a, o), o = a);
  return this;
}
function eo(t) {
  t || (t = no);
  function e(g, d) {
    return g && d ? t(g.__data__, d.__data__) : !g - !d;
  }
  for (var n = this._groups, r = n.length, i = new Array(r), o = 0; o < r; ++o) {
    for (var a = n[o], s = a.length, l = i[o] = new Array(s), u, c = 0; c < s; ++c)
      (u = a[c]) && (l[c] = u);
    l.sort(e);
  }
  return new lt(i, this._parents).order();
}
function no(t, e) {
  return t < e ? -1 : t > e ? 1 : t >= e ? 0 : NaN;
}
function ro() {
  var t = arguments[0];
  return arguments[0] = this, t.apply(null, arguments), this;
}
function io() {
  return Array.from(this);
}
function oo() {
  for (var t = this._groups, e = 0, n = t.length; e < n; ++e)
    for (var r = t[e], i = 0, o = r.length; i < o; ++i) {
      var a = r[i];
      if (a) return a;
    }
  return null;
}
function ao() {
  let t = 0;
  for (const e of this) ++t;
  return t;
}
function so() {
  return !this.node();
}
function uo(t) {
  for (var e = this._groups, n = 0, r = e.length; n < r; ++n)
    for (var i = e[n], o = 0, a = i.length, s; o < a; ++o)
      (s = i[o]) && t.call(s, s.__data__, o, i);
  return this;
}
function lo(t) {
  return function() {
    this.removeAttribute(t);
  };
}
function co(t) {
  return function() {
    this.removeAttributeNS(t.space, t.local);
  };
}
function fo(t, e) {
  return function() {
    this.setAttribute(t, e);
  };
}
function ho(t, e) {
  return function() {
    this.setAttributeNS(t.space, t.local, e);
  };
}
function po(t, e) {
  return function() {
    var n = e.apply(this, arguments);
    n == null ? this.removeAttribute(t) : this.setAttribute(t, n);
  };
}
function go(t, e) {
  return function() {
    var n = e.apply(this, arguments);
    n == null ? this.removeAttributeNS(t.space, t.local) : this.setAttributeNS(t.space, t.local, n);
  };
}
function mo(t, e) {
  var n = Ue(t);
  if (arguments.length < 2) {
    var r = this.node();
    return n.local ? r.getAttributeNS(n.space, n.local) : r.getAttribute(n);
  }
  return this.each((e == null ? n.local ? co : lo : typeof e == "function" ? n.local ? go : po : n.local ? ho : fo)(n, e));
}
function xr(t) {
  return t.ownerDocument && t.ownerDocument.defaultView || t.document && t || t.defaultView;
}
function yo(t) {
  return function() {
    this.style.removeProperty(t);
  };
}
function vo(t, e, n) {
  return function() {
    this.style.setProperty(t, e, n);
  };
}
function _o(t, e, n) {
  return function() {
    var r = e.apply(this, arguments);
    r == null ? this.style.removeProperty(t) : this.style.setProperty(t, r, n);
  };
}
function xo(t, e, n) {
  return arguments.length > 1 ? this.each((e == null ? yo : typeof e == "function" ? _o : vo)(t, e, n ?? "")) : Bt(this.node(), t);
}
function Bt(t, e) {
  return t.style.getPropertyValue(e) || xr(t).getComputedStyle(t, null).getPropertyValue(e);
}
function wo(t) {
  return function() {
    delete this[t];
  };
}
function bo(t, e) {
  return function() {
    this[t] = e;
  };
}
function ko(t, e) {
  return function() {
    var n = e.apply(this, arguments);
    n == null ? delete this[t] : this[t] = n;
  };
}
function Mo(t, e) {
  return arguments.length > 1 ? this.each((e == null ? wo : typeof e == "function" ? ko : bo)(t, e)) : this.node()[t];
}
function wr(t) {
  return t.trim().split(/^|\s+/);
}
function fn(t) {
  return t.classList || new br(t);
}
function br(t) {
  this._node = t, this._names = wr(t.getAttribute("class") || "");
}
br.prototype = {
  add: function(t) {
    var e = this._names.indexOf(t);
    e < 0 && (this._names.push(t), this._node.setAttribute("class", this._names.join(" ")));
  },
  remove: function(t) {
    var e = this._names.indexOf(t);
    e >= 0 && (this._names.splice(e, 1), this._node.setAttribute("class", this._names.join(" ")));
  },
  contains: function(t) {
    return this._names.indexOf(t) >= 0;
  }
};
function kr(t, e) {
  for (var n = fn(t), r = -1, i = e.length; ++r < i; ) n.add(e[r]);
}
function Mr(t, e) {
  for (var n = fn(t), r = -1, i = e.length; ++r < i; ) n.remove(e[r]);
}
function Co(t) {
  return function() {
    kr(this, t);
  };
}
function To(t) {
  return function() {
    Mr(this, t);
  };
}
function So(t, e) {
  return function() {
    (e.apply(this, arguments) ? kr : Mr)(this, t);
  };
}
function Ao(t, e) {
  var n = wr(t + "");
  if (arguments.length < 2) {
    for (var r = fn(this.node()), i = -1, o = n.length; ++i < o; ) if (!r.contains(n[i])) return !1;
    return !0;
  }
  return this.each((typeof e == "function" ? So : e ? Co : To)(n, e));
}
function Eo() {
  this.textContent = "";
}
function Do(t) {
  return function() {
    this.textContent = t;
  };
}
function No(t) {
  return function() {
    var e = t.apply(this, arguments);
    this.textContent = e ?? "";
  };
}
function Ro(t) {
  return arguments.length ? this.each(t == null ? Eo : (typeof t == "function" ? No : Do)(t)) : this.node().textContent;
}
function Fo() {
  this.innerHTML = "";
}
function Uo(t) {
  return function() {
    this.innerHTML = t;
  };
}
function zo(t) {
  return function() {
    var e = t.apply(this, arguments);
    this.innerHTML = e ?? "";
  };
}
function Io(t) {
  return arguments.length ? this.each(t == null ? Fo : (typeof t == "function" ? zo : Uo)(t)) : this.node().innerHTML;
}
function Oo() {
  this.nextSibling && this.parentNode.appendChild(this);
}
function $o() {
  return this.each(Oo);
}
function Lo() {
  this.previousSibling && this.parentNode.insertBefore(this, this.parentNode.firstChild);
}
function Ho() {
  return this.each(Lo);
}
function Yo(t) {
  var e = typeof t == "function" ? t : gr(t);
  return this.select(function() {
    return this.appendChild(e.apply(this, arguments));
  });
}
function Po() {
  return null;
}
function Wo(t, e) {
  var n = typeof t == "function" ? t : gr(t), r = e == null ? Po : typeof e == "function" ? e : cn(e);
  return this.select(function() {
    return this.insertBefore(n.apply(this, arguments), r.apply(this, arguments) || null);
  });
}
function qo() {
  var t = this.parentNode;
  t && t.removeChild(this);
}
function Xo() {
  return this.each(qo);
}
function Vo() {
  var t = this.cloneNode(!1), e = this.parentNode;
  return e ? e.insertBefore(t, this.nextSibling) : t;
}
function Bo() {
  var t = this.cloneNode(!0), e = this.parentNode;
  return e ? e.insertBefore(t, this.nextSibling) : t;
}
function Go(t) {
  return this.select(t ? Bo : Vo);
}
function Zo(t) {
  return arguments.length ? this.property("__data__", t) : this.node().__data__;
}
function Ko(t) {
  return function(e) {
    t.call(this, e, this.__data__);
  };
}
function Qo(t) {
  return t.trim().split(/^|\s+/).map(function(e) {
    var n = "", r = e.indexOf(".");
    return r >= 0 && (n = e.slice(r + 1), e = e.slice(0, r)), { type: e, name: n };
  });
}
function Jo(t) {
  return function() {
    var e = this.__on;
    if (e) {
      for (var n = 0, r = -1, i = e.length, o; n < i; ++n)
        o = e[n], (!t.type || o.type === t.type) && o.name === t.name ? this.removeEventListener(o.type, o.listener, o.options) : e[++r] = o;
      ++r ? e.length = r : delete this.__on;
    }
  };
}
function jo(t, e, n) {
  return function() {
    var r = this.__on, i, o = Ko(e);
    if (r) {
      for (var a = 0, s = r.length; a < s; ++a)
        if ((i = r[a]).type === t.type && i.name === t.name) {
          this.removeEventListener(i.type, i.listener, i.options), this.addEventListener(i.type, i.listener = o, i.options = n), i.value = e;
          return;
        }
    }
    this.addEventListener(t.type, o, n), i = { type: t.type, name: t.name, value: e, listener: o, options: n }, r ? r.push(i) : this.__on = [i];
  };
}
function ta(t, e, n) {
  var r = Qo(t + ""), i, o = r.length, a;
  if (arguments.length < 2) {
    var s = this.node().__on;
    if (s) {
      for (var l = 0, u = s.length, c; l < u; ++l)
        for (i = 0, c = s[l]; i < o; ++i)
          if ((a = r[i]).type === c.type && a.name === c.name)
            return c.value;
    }
    return;
  }
  for (s = e ? jo : Jo, i = 0; i < o; ++i) this.each(s(r[i], e, n));
  return this;
}
function Cr(t, e, n) {
  var r = xr(t), i = r.CustomEvent;
  typeof i == "function" ? i = new i(e, n) : (i = r.document.createEvent("Event"), n ? (i.initEvent(e, n.bubbles, n.cancelable), i.detail = n.detail) : i.initEvent(e, !1, !1)), t.dispatchEvent(i);
}
function ea(t, e) {
  return function() {
    return Cr(this, t, e);
  };
}
function na(t, e) {
  return function() {
    return Cr(this, t, e.apply(this, arguments));
  };
}
function ra(t, e) {
  return this.each((typeof e == "function" ? na : ea)(t, e));
}
function* ia() {
  for (var t = this._groups, e = 0, n = t.length; e < n; ++e)
    for (var r = t[e], i = 0, o = r.length, a; i < o; ++i)
      (a = r[i]) && (yield a);
}
var Tr = [null];
function lt(t, e) {
  this._groups = t, this._parents = e;
}
function fe() {
  return new lt([[document.documentElement]], Tr);
}
function oa() {
  return this;
}
lt.prototype = fe.prototype = {
  constructor: lt,
  select: Di,
  selectAll: Ui,
  selectChild: $i,
  selectChildren: Pi,
  filter: Wi,
  data: Zi,
  enter: qi,
  exit: Qi,
  join: Ji,
  merge: ji,
  selection: oa,
  order: to,
  sort: eo,
  call: ro,
  nodes: io,
  node: oo,
  size: ao,
  empty: so,
  each: uo,
  attr: mo,
  style: xo,
  property: Mo,
  classed: Ao,
  text: Ro,
  html: Io,
  raise: $o,
  lower: Ho,
  append: Yo,
  insert: Wo,
  remove: Xo,
  clone: Go,
  datum: Zo,
  on: ta,
  dispatch: ra,
  [Symbol.iterator]: ia
};
function ct(t) {
  return typeof t == "string" ? new lt([[document.querySelector(t)]], [document.documentElement]) : new lt([[t]], Tr);
}
function aa(t) {
  let e;
  for (; e = t.sourceEvent; ) t = e;
  return t;
}
function Rt(t, e) {
  if (t = aa(t), e === void 0 && (e = t.currentTarget), e) {
    var n = e.ownerSVGElement || e;
    if (n.createSVGPoint) {
      var r = n.createSVGPoint();
      return r.x = t.clientX, r.y = t.clientY, r = r.matrixTransform(e.getScreenCTM().inverse()), [r.x, r.y];
    }
    if (e.getBoundingClientRect) {
      var i = e.getBoundingClientRect();
      return [t.clientX - i.left - e.clientLeft, t.clientY - i.top - e.clientTop];
    }
  }
  return [t.pageX, t.pageY];
}
const Je = { capture: !0, passive: !1 };
function je(t) {
  t.preventDefault(), t.stopImmediatePropagation();
}
function sa(t) {
  var e = t.document.documentElement, n = ct(t).on("dragstart.drag", je, Je);
  "onselectstart" in e ? n.on("selectstart.drag", je, Je) : (e.__noselect = e.style.MozUserSelect, e.style.MozUserSelect = "none");
}
function ua(t, e) {
  var n = t.document.documentElement, r = ct(t).on("dragstart.drag", null);
  e && (r.on("click.drag", je, Je), setTimeout(function() {
    r.on("click.drag", null);
  }, 0)), "onselectstart" in n ? r.on("selectstart.drag", null) : (n.style.MozUserSelect = n.__noselect, delete n.__noselect);
}
function hn(t, e, n) {
  t.prototype = e.prototype = n, n.constructor = t;
}
function Sr(t, e) {
  var n = Object.create(t.prototype);
  for (var r in e) n[r] = e[r];
  return n;
}
function he() {
}
var ue = 0.7, Ce = 1 / ue, Vt = "\\s*([+-]?\\d+)\\s*", le = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*", xt = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*", la = /^#([0-9a-f]{3,8})$/, ca = new RegExp(`^rgb\\(${Vt},${Vt},${Vt}\\)$`), fa = new RegExp(`^rgb\\(${xt},${xt},${xt}\\)$`), ha = new RegExp(`^rgba\\(${Vt},${Vt},${Vt},${le}\\)$`), da = new RegExp(`^rgba\\(${xt},${xt},${xt},${le}\\)$`), pa = new RegExp(`^hsl\\(${le},${xt},${xt}\\)$`), ga = new RegExp(`^hsla\\(${le},${xt},${xt},${le}\\)$`), In = {
  aliceblue: 15792383,
  antiquewhite: 16444375,
  aqua: 65535,
  aquamarine: 8388564,
  azure: 15794175,
  beige: 16119260,
  bisque: 16770244,
  black: 0,
  blanchedalmond: 16772045,
  blue: 255,
  blueviolet: 9055202,
  brown: 10824234,
  burlywood: 14596231,
  cadetblue: 6266528,
  chartreuse: 8388352,
  chocolate: 13789470,
  coral: 16744272,
  cornflowerblue: 6591981,
  cornsilk: 16775388,
  crimson: 14423100,
  cyan: 65535,
  darkblue: 139,
  darkcyan: 35723,
  darkgoldenrod: 12092939,
  darkgray: 11119017,
  darkgreen: 25600,
  darkgrey: 11119017,
  darkkhaki: 12433259,
  darkmagenta: 9109643,
  darkolivegreen: 5597999,
  darkorange: 16747520,
  darkorchid: 10040012,
  darkred: 9109504,
  darksalmon: 15308410,
  darkseagreen: 9419919,
  darkslateblue: 4734347,
  darkslategray: 3100495,
  darkslategrey: 3100495,
  darkturquoise: 52945,
  darkviolet: 9699539,
  deeppink: 16716947,
  deepskyblue: 49151,
  dimgray: 6908265,
  dimgrey: 6908265,
  dodgerblue: 2003199,
  firebrick: 11674146,
  floralwhite: 16775920,
  forestgreen: 2263842,
  fuchsia: 16711935,
  gainsboro: 14474460,
  ghostwhite: 16316671,
  gold: 16766720,
  goldenrod: 14329120,
  gray: 8421504,
  green: 32768,
  greenyellow: 11403055,
  grey: 8421504,
  honeydew: 15794160,
  hotpink: 16738740,
  indianred: 13458524,
  indigo: 4915330,
  ivory: 16777200,
  khaki: 15787660,
  lavender: 15132410,
  lavenderblush: 16773365,
  lawngreen: 8190976,
  lemonchiffon: 16775885,
  lightblue: 11393254,
  lightcoral: 15761536,
  lightcyan: 14745599,
  lightgoldenrodyellow: 16448210,
  lightgray: 13882323,
  lightgreen: 9498256,
  lightgrey: 13882323,
  lightpink: 16758465,
  lightsalmon: 16752762,
  lightseagreen: 2142890,
  lightskyblue: 8900346,
  lightslategray: 7833753,
  lightslategrey: 7833753,
  lightsteelblue: 11584734,
  lightyellow: 16777184,
  lime: 65280,
  limegreen: 3329330,
  linen: 16445670,
  magenta: 16711935,
  maroon: 8388608,
  mediumaquamarine: 6737322,
  mediumblue: 205,
  mediumorchid: 12211667,
  mediumpurple: 9662683,
  mediumseagreen: 3978097,
  mediumslateblue: 8087790,
  mediumspringgreen: 64154,
  mediumturquoise: 4772300,
  mediumvioletred: 13047173,
  midnightblue: 1644912,
  mintcream: 16121850,
  mistyrose: 16770273,
  moccasin: 16770229,
  navajowhite: 16768685,
  navy: 128,
  oldlace: 16643558,
  olive: 8421376,
  olivedrab: 7048739,
  orange: 16753920,
  orangered: 16729344,
  orchid: 14315734,
  palegoldenrod: 15657130,
  palegreen: 10025880,
  paleturquoise: 11529966,
  palevioletred: 14381203,
  papayawhip: 16773077,
  peachpuff: 16767673,
  peru: 13468991,
  pink: 16761035,
  plum: 14524637,
  powderblue: 11591910,
  purple: 8388736,
  rebeccapurple: 6697881,
  red: 16711680,
  rosybrown: 12357519,
  royalblue: 4286945,
  saddlebrown: 9127187,
  salmon: 16416882,
  sandybrown: 16032864,
  seagreen: 3050327,
  seashell: 16774638,
  sienna: 10506797,
  silver: 12632256,
  skyblue: 8900331,
  slateblue: 6970061,
  slategray: 7372944,
  slategrey: 7372944,
  snow: 16775930,
  springgreen: 65407,
  steelblue: 4620980,
  tan: 13808780,
  teal: 32896,
  thistle: 14204888,
  tomato: 16737095,
  turquoise: 4251856,
  violet: 15631086,
  wheat: 16113331,
  white: 16777215,
  whitesmoke: 16119285,
  yellow: 16776960,
  yellowgreen: 10145074
};
hn(he, zt, {
  copy(t) {
    return Object.assign(new this.constructor(), this, t);
  },
  displayable() {
    return this.rgb().displayable();
  },
  hex: On,
  // Deprecated! Use color.formatHex.
  formatHex: On,
  formatHex8: ma,
  formatHsl: ya,
  formatRgb: $n,
  toString: $n
});
function On() {
  return this.rgb().formatHex();
}
function ma() {
  return this.rgb().formatHex8();
}
function ya() {
  return Ar(this).formatHsl();
}
function $n() {
  return this.rgb().formatRgb();
}
function zt(t) {
  var e, n;
  return t = (t + "").trim().toLowerCase(), (e = la.exec(t)) ? (n = e[1].length, e = parseInt(e[1], 16), n === 6 ? Ln(e) : n === 3 ? new ut(e >> 8 & 15 | e >> 4 & 240, e >> 4 & 15 | e & 240, (e & 15) << 4 | e & 15, 1) : n === 8 ? pe(e >> 24 & 255, e >> 16 & 255, e >> 8 & 255, (e & 255) / 255) : n === 4 ? pe(e >> 12 & 15 | e >> 8 & 240, e >> 8 & 15 | e >> 4 & 240, e >> 4 & 15 | e & 240, ((e & 15) << 4 | e & 15) / 255) : null) : (e = ca.exec(t)) ? new ut(e[1], e[2], e[3], 1) : (e = fa.exec(t)) ? new ut(e[1] * 255 / 100, e[2] * 255 / 100, e[3] * 255 / 100, 1) : (e = ha.exec(t)) ? pe(e[1], e[2], e[3], e[4]) : (e = da.exec(t)) ? pe(e[1] * 255 / 100, e[2] * 255 / 100, e[3] * 255 / 100, e[4]) : (e = pa.exec(t)) ? Pn(e[1], e[2] / 100, e[3] / 100, 1) : (e = ga.exec(t)) ? Pn(e[1], e[2] / 100, e[3] / 100, e[4]) : In.hasOwnProperty(t) ? Ln(In[t]) : t === "transparent" ? new ut(NaN, NaN, NaN, 0) : null;
}
function Ln(t) {
  return new ut(t >> 16 & 255, t >> 8 & 255, t & 255, 1);
}
function pe(t, e, n, r) {
  return r <= 0 && (t = e = n = NaN), new ut(t, e, n, r);
}
function va(t) {
  return t instanceof he || (t = zt(t)), t ? (t = t.rgb(), new ut(t.r, t.g, t.b, t.opacity)) : new ut();
}
function tn(t, e, n, r) {
  return arguments.length === 1 ? va(t) : new ut(t, e, n, r ?? 1);
}
function ut(t, e, n, r) {
  this.r = +t, this.g = +e, this.b = +n, this.opacity = +r;
}
hn(ut, tn, Sr(he, {
  brighter(t) {
    return t = t == null ? Ce : Math.pow(Ce, t), new ut(this.r * t, this.g * t, this.b * t, this.opacity);
  },
  darker(t) {
    return t = t == null ? ue : Math.pow(ue, t), new ut(this.r * t, this.g * t, this.b * t, this.opacity);
  },
  rgb() {
    return this;
  },
  clamp() {
    return new ut(Ut(this.r), Ut(this.g), Ut(this.b), Te(this.opacity));
  },
  displayable() {
    return -0.5 <= this.r && this.r < 255.5 && -0.5 <= this.g && this.g < 255.5 && -0.5 <= this.b && this.b < 255.5 && 0 <= this.opacity && this.opacity <= 1;
  },
  hex: Hn,
  // Deprecated! Use color.formatHex.
  formatHex: Hn,
  formatHex8: _a,
  formatRgb: Yn,
  toString: Yn
}));
function Hn() {
  return `#${Ft(this.r)}${Ft(this.g)}${Ft(this.b)}`;
}
function _a() {
  return `#${Ft(this.r)}${Ft(this.g)}${Ft(this.b)}${Ft((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`;
}
function Yn() {
  const t = Te(this.opacity);
  return `${t === 1 ? "rgb(" : "rgba("}${Ut(this.r)}, ${Ut(this.g)}, ${Ut(this.b)}${t === 1 ? ")" : `, ${t})`}`;
}
function Te(t) {
  return isNaN(t) ? 1 : Math.max(0, Math.min(1, t));
}
function Ut(t) {
  return Math.max(0, Math.min(255, Math.round(t) || 0));
}
function Ft(t) {
  return t = Ut(t), (t < 16 ? "0" : "") + t.toString(16);
}
function Pn(t, e, n, r) {
  return r <= 0 ? t = e = n = NaN : n <= 0 || n >= 1 ? t = e = NaN : e <= 0 && (t = NaN), new dt(t, e, n, r);
}
function Ar(t) {
  if (t instanceof dt) return new dt(t.h, t.s, t.l, t.opacity);
  if (t instanceof he || (t = zt(t)), !t) return new dt();
  if (t instanceof dt) return t;
  t = t.rgb();
  var e = t.r / 255, n = t.g / 255, r = t.b / 255, i = Math.min(e, n, r), o = Math.max(e, n, r), a = NaN, s = o - i, l = (o + i) / 2;
  return s ? (e === o ? a = (n - r) / s + (n < r) * 6 : n === o ? a = (r - e) / s + 2 : a = (e - n) / s + 4, s /= l < 0.5 ? o + i : 2 - o - i, a *= 60) : s = l > 0 && l < 1 ? 0 : a, new dt(a, s, l, t.opacity);
}
function xa(t, e, n, r) {
  return arguments.length === 1 ? Ar(t) : new dt(t, e, n, r ?? 1);
}
function dt(t, e, n, r) {
  this.h = +t, this.s = +e, this.l = +n, this.opacity = +r;
}
hn(dt, xa, Sr(he, {
  brighter(t) {
    return t = t == null ? Ce : Math.pow(Ce, t), new dt(this.h, this.s, this.l * t, this.opacity);
  },
  darker(t) {
    return t = t == null ? ue : Math.pow(ue, t), new dt(this.h, this.s, this.l * t, this.opacity);
  },
  rgb() {
    var t = this.h % 360 + (this.h < 0) * 360, e = isNaN(t) || isNaN(this.s) ? 0 : this.s, n = this.l, r = n + (n < 0.5 ? n : 1 - n) * e, i = 2 * n - r;
    return new ut(
      Pe(t >= 240 ? t - 240 : t + 120, i, r),
      Pe(t, i, r),
      Pe(t < 120 ? t + 240 : t - 120, i, r),
      this.opacity
    );
  },
  clamp() {
    return new dt(Wn(this.h), ge(this.s), ge(this.l), Te(this.opacity));
  },
  displayable() {
    return (0 <= this.s && this.s <= 1 || isNaN(this.s)) && 0 <= this.l && this.l <= 1 && 0 <= this.opacity && this.opacity <= 1;
  },
  formatHsl() {
    const t = Te(this.opacity);
    return `${t === 1 ? "hsl(" : "hsla("}${Wn(this.h)}, ${ge(this.s) * 100}%, ${ge(this.l) * 100}%${t === 1 ? ")" : `, ${t})`}`;
  }
}));
function Wn(t) {
  return t = (t || 0) % 360, t < 0 ? t + 360 : t;
}
function ge(t) {
  return Math.max(0, Math.min(1, t || 0));
}
function Pe(t, e, n) {
  return (t < 60 ? e + (n - e) * t / 60 : t < 180 ? n : t < 240 ? e + (n - e) * (240 - t) / 60 : e) * 255;
}
const dn = (t) => () => t;
function wa(t, e) {
  return function(n) {
    return t + n * e;
  };
}
function ba(t, e, n) {
  return t = Math.pow(t, n), e = Math.pow(e, n) - t, n = 1 / n, function(r) {
    return Math.pow(t + r * e, n);
  };
}
function ka(t) {
  return (t = +t) == 1 ? Er : function(e, n) {
    return n - e ? ba(e, n, t) : dn(isNaN(e) ? n : e);
  };
}
function Er(t, e) {
  var n = e - t;
  return n ? wa(t, n) : dn(isNaN(t) ? e : t);
}
const Se = function t(e) {
  var n = ka(e);
  function r(i, o) {
    var a = n((i = tn(i)).r, (o = tn(o)).r), s = n(i.g, o.g), l = n(i.b, o.b), u = Er(i.opacity, o.opacity);
    return function(c) {
      return i.r = a(c), i.g = s(c), i.b = l(c), i.opacity = u(c), i + "";
    };
  }
  return r.gamma = t, r;
}(1);
function Ma(t, e) {
  e || (e = []);
  var n = t ? Math.min(e.length, t.length) : 0, r = e.slice(), i;
  return function(o) {
    for (i = 0; i < n; ++i) r[i] = t[i] * (1 - o) + e[i] * o;
    return r;
  };
}
function Ca(t) {
  return ArrayBuffer.isView(t) && !(t instanceof DataView);
}
function Ta(t, e) {
  var n = e ? e.length : 0, r = t ? Math.min(n, t.length) : 0, i = new Array(r), o = new Array(n), a;
  for (a = 0; a < r; ++a) i[a] = pn(t[a], e[a]);
  for (; a < n; ++a) o[a] = e[a];
  return function(s) {
    for (a = 0; a < r; ++a) o[a] = i[a](s);
    return o;
  };
}
function Sa(t, e) {
  var n = /* @__PURE__ */ new Date();
  return t = +t, e = +e, function(r) {
    return n.setTime(t * (1 - r) + e * r), n;
  };
}
function ht(t, e) {
  return t = +t, e = +e, function(n) {
    return t * (1 - n) + e * n;
  };
}
function Aa(t, e) {
  var n = {}, r = {}, i;
  (t === null || typeof t != "object") && (t = {}), (e === null || typeof e != "object") && (e = {});
  for (i in e)
    i in t ? n[i] = pn(t[i], e[i]) : r[i] = e[i];
  return function(o) {
    for (i in n) r[i] = n[i](o);
    return r;
  };
}
var en = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g, We = new RegExp(en.source, "g");
function Ea(t) {
  return function() {
    return t;
  };
}
function Da(t) {
  return function(e) {
    return t(e) + "";
  };
}
function Dr(t, e) {
  var n = en.lastIndex = We.lastIndex = 0, r, i, o, a = -1, s = [], l = [];
  for (t = t + "", e = e + ""; (r = en.exec(t)) && (i = We.exec(e)); )
    (o = i.index) > n && (o = e.slice(n, o), s[a] ? s[a] += o : s[++a] = o), (r = r[0]) === (i = i[0]) ? s[a] ? s[a] += i : s[++a] = i : (s[++a] = null, l.push({ i: a, x: ht(r, i) })), n = We.lastIndex;
  return n < e.length && (o = e.slice(n), s[a] ? s[a] += o : s[++a] = o), s.length < 2 ? l[0] ? Da(l[0].x) : Ea(e) : (e = l.length, function(u) {
    for (var c = 0, g; c < e; ++c) s[(g = l[c]).i] = g.x(u);
    return s.join("");
  });
}
function pn(t, e) {
  var n = typeof e, r;
  return e == null || n === "boolean" ? dn(e) : (n === "number" ? ht : n === "string" ? (r = zt(e)) ? (e = r, Se) : Dr : e instanceof zt ? Se : e instanceof Date ? Sa : Ca(e) ? Ma : Array.isArray(e) ? Ta : typeof e.valueOf != "function" && typeof e.toString != "function" || isNaN(e) ? Aa : ht)(t, e);
}
function Na(t, e) {
  return t = +t, e = +e, function(n) {
    return Math.round(t * (1 - n) + e * n);
  };
}
var qn = 180 / Math.PI, nn = {
  translateX: 0,
  translateY: 0,
  rotate: 0,
  skewX: 0,
  scaleX: 1,
  scaleY: 1
};
function Nr(t, e, n, r, i, o) {
  var a, s, l;
  return (a = Math.sqrt(t * t + e * e)) && (t /= a, e /= a), (l = t * n + e * r) && (n -= t * l, r -= e * l), (s = Math.sqrt(n * n + r * r)) && (n /= s, r /= s, l /= s), t * r < e * n && (t = -t, e = -e, l = -l, a = -a), {
    translateX: i,
    translateY: o,
    rotate: Math.atan2(e, t) * qn,
    skewX: Math.atan(l) * qn,
    scaleX: a,
    scaleY: s
  };
}
var me;
function Ra(t) {
  const e = new (typeof DOMMatrix == "function" ? DOMMatrix : WebKitCSSMatrix)(t + "");
  return e.isIdentity ? nn : Nr(e.a, e.b, e.c, e.d, e.e, e.f);
}
function Fa(t) {
  return t == null || (me || (me = document.createElementNS("http://www.w3.org/2000/svg", "g")), me.setAttribute("transform", t), !(t = me.transform.baseVal.consolidate())) ? nn : (t = t.matrix, Nr(t.a, t.b, t.c, t.d, t.e, t.f));
}
function Rr(t, e, n, r) {
  function i(u) {
    return u.length ? u.pop() + " " : "";
  }
  function o(u, c, g, d, v, L) {
    if (u !== g || c !== d) {
      var $ = v.push("translate(", null, e, null, n);
      L.push({ i: $ - 4, x: ht(u, g) }, { i: $ - 2, x: ht(c, d) });
    } else (g || d) && v.push("translate(" + g + e + d + n);
  }
  function a(u, c, g, d) {
    u !== c ? (u - c > 180 ? c += 360 : c - u > 180 && (u += 360), d.push({ i: g.push(i(g) + "rotate(", null, r) - 2, x: ht(u, c) })) : c && g.push(i(g) + "rotate(" + c + r);
  }
  function s(u, c, g, d) {
    u !== c ? d.push({ i: g.push(i(g) + "skewX(", null, r) - 2, x: ht(u, c) }) : c && g.push(i(g) + "skewX(" + c + r);
  }
  function l(u, c, g, d, v, L) {
    if (u !== g || c !== d) {
      var $ = v.push(i(v) + "scale(", null, ",", null, ")");
      L.push({ i: $ - 4, x: ht(u, g) }, { i: $ - 2, x: ht(c, d) });
    } else (g !== 1 || d !== 1) && v.push(i(v) + "scale(" + g + "," + d + ")");
  }
  return function(u, c) {
    var g = [], d = [];
    return u = t(u), c = t(c), o(u.translateX, u.translateY, c.translateX, c.translateY, g, d), a(u.rotate, c.rotate, g, d), s(u.skewX, c.skewX, g, d), l(u.scaleX, u.scaleY, c.scaleX, c.scaleY, g, d), u = c = null, function(v) {
      for (var L = -1, $ = d.length, G; ++L < $; ) g[(G = d[L]).i] = G.x(v);
      return g.join("");
    };
  };
}
var Ua = Rr(Ra, "px, ", "px)", "deg)"), za = Rr(Fa, ", ", ")", ")"), Ia = 1e-12;
function Xn(t) {
  return ((t = Math.exp(t)) + 1 / t) / 2;
}
function Oa(t) {
  return ((t = Math.exp(t)) - 1 / t) / 2;
}
function $a(t) {
  return ((t = Math.exp(2 * t)) - 1) / (t + 1);
}
const La = function t(e, n, r) {
  function i(o, a) {
    var s = o[0], l = o[1], u = o[2], c = a[0], g = a[1], d = a[2], v = c - s, L = g - l, $ = v * v + L * L, G, S;
    if ($ < Ia)
      S = Math.log(d / u) / e, G = function(z) {
        return [
          s + z * v,
          l + z * L,
          u * Math.exp(e * z * S)
        ];
      };
    else {
      var tt = Math.sqrt($), Z = (d * d - u * u + r * $) / (2 * u * n * tt), H = (d * d - u * u - r * $) / (2 * d * n * tt), K = Math.log(Math.sqrt(Z * Z + 1) - Z), A = Math.log(Math.sqrt(H * H + 1) - H);
      S = (A - K) / e, G = function(z) {
        var f = z * S, h = Xn(K), x = u / (n * tt) * (h * $a(e * f + K) - Oa(K));
        return [
          s + x * v,
          l + x * L,
          u * h / Xn(e * f + K)
        ];
      };
    }
    return G.duration = S * 1e3 * e / Math.SQRT2, G;
  }
  return i.rho = function(o) {
    var a = Math.max(1e-3, +o), s = a * a, l = s * s;
    return t(a, s, l);
  }, i;
}(Math.SQRT2, 2, 4);
var Gt = 0, ae = 0, te = 0, Fr = 1e3, Ae, se, Ee = 0, It = 0, ze = 0, ce = typeof performance == "object" && performance.now ? performance : Date, Ur = typeof window == "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(t) {
  setTimeout(t, 17);
};
function gn() {
  return It || (Ur(Ha), It = ce.now() + ze);
}
function Ha() {
  It = 0;
}
function De() {
  this._call = this._time = this._next = null;
}
De.prototype = zr.prototype = {
  constructor: De,
  restart: function(t, e, n) {
    if (typeof t != "function") throw new TypeError("callback is not a function");
    n = (n == null ? gn() : +n) + (e == null ? 0 : +e), !this._next && se !== this && (se ? se._next = this : Ae = this, se = this), this._call = t, this._time = n, rn();
  },
  stop: function() {
    this._call && (this._call = null, this._time = 1 / 0, rn());
  }
};
function zr(t, e, n) {
  var r = new De();
  return r.restart(t, e, n), r;
}
function Ya() {
  gn(), ++Gt;
  for (var t = Ae, e; t; )
    (e = It - t._time) >= 0 && t._call.call(void 0, e), t = t._next;
  --Gt;
}
function Vn() {
  It = (Ee = ce.now()) + ze, Gt = ae = 0;
  try {
    Ya();
  } finally {
    Gt = 0, Wa(), It = 0;
  }
}
function Pa() {
  var t = ce.now(), e = t - Ee;
  e > Fr && (ze -= e, Ee = t);
}
function Wa() {
  for (var t, e = Ae, n, r = 1 / 0; e; )
    e._call ? (r > e._time && (r = e._time), t = e, e = e._next) : (n = e._next, e._next = null, e = t ? t._next = n : Ae = n);
  se = t, rn(r);
}
function rn(t) {
  if (!Gt) {
    ae && (ae = clearTimeout(ae));
    var e = t - It;
    e > 24 ? (t < 1 / 0 && (ae = setTimeout(Vn, t - ce.now() - ze)), te && (te = clearInterval(te))) : (te || (Ee = ce.now(), te = setInterval(Pa, Fr)), Gt = 1, Ur(Vn));
  }
}
function Bn(t, e, n) {
  var r = new De();
  return e = e == null ? 0 : +e, r.restart((i) => {
    r.stop(), t(i + e);
  }, e, n), r;
}
var qa = ln("start", "end", "cancel", "interrupt"), Xa = [], Ir = 0, Gn = 1, on = 2, we = 3, Zn = 4, an = 5, be = 6;
function Ie(t, e, n, r, i, o) {
  var a = t.__transition;
  if (!a) t.__transition = {};
  else if (n in a) return;
  Va(t, n, {
    name: e,
    index: r,
    // For context during callback.
    group: i,
    // For context during callback.
    on: qa,
    tween: Xa,
    time: o.time,
    delay: o.delay,
    duration: o.duration,
    ease: o.ease,
    timer: null,
    state: Ir
  });
}
function mn(t, e) {
  var n = pt(t, e);
  if (n.state > Ir) throw new Error("too late; already scheduled");
  return n;
}
function wt(t, e) {
  var n = pt(t, e);
  if (n.state > we) throw new Error("too late; already running");
  return n;
}
function pt(t, e) {
  var n = t.__transition;
  if (!n || !(n = n[e])) throw new Error("transition not found");
  return n;
}
function Va(t, e, n) {
  var r = t.__transition, i;
  r[e] = n, n.timer = zr(o, 0, n.time);
  function o(u) {
    n.state = Gn, n.timer.restart(a, n.delay, n.time), n.delay <= u && a(u - n.delay);
  }
  function a(u) {
    var c, g, d, v;
    if (n.state !== Gn) return l();
    for (c in r)
      if (v = r[c], v.name === n.name) {
        if (v.state === we) return Bn(a);
        v.state === Zn ? (v.state = be, v.timer.stop(), v.on.call("interrupt", t, t.__data__, v.index, v.group), delete r[c]) : +c < e && (v.state = be, v.timer.stop(), v.on.call("cancel", t, t.__data__, v.index, v.group), delete r[c]);
      }
    if (Bn(function() {
      n.state === we && (n.state = Zn, n.timer.restart(s, n.delay, n.time), s(u));
    }), n.state = on, n.on.call("start", t, t.__data__, n.index, n.group), n.state === on) {
      for (n.state = we, i = new Array(d = n.tween.length), c = 0, g = -1; c < d; ++c)
        (v = n.tween[c].value.call(t, t.__data__, n.index, n.group)) && (i[++g] = v);
      i.length = g + 1;
    }
  }
  function s(u) {
    for (var c = u < n.duration ? n.ease.call(null, u / n.duration) : (n.timer.restart(l), n.state = an, 1), g = -1, d = i.length; ++g < d; )
      i[g].call(t, c);
    n.state === an && (n.on.call("end", t, t.__data__, n.index, n.group), l());
  }
  function l() {
    n.state = be, n.timer.stop(), delete r[e];
    for (var u in r) return;
    delete t.__transition;
  }
}
function ke(t, e) {
  var n = t.__transition, r, i, o = !0, a;
  if (n) {
    e = e == null ? null : e + "";
    for (a in n) {
      if ((r = n[a]).name !== e) {
        o = !1;
        continue;
      }
      i = r.state > on && r.state < an, r.state = be, r.timer.stop(), r.on.call(i ? "interrupt" : "cancel", t, t.__data__, r.index, r.group), delete n[a];
    }
    o && delete t.__transition;
  }
}
function Ba(t) {
  return this.each(function() {
    ke(this, t);
  });
}
function Ga(t, e) {
  var n, r;
  return function() {
    var i = wt(this, t), o = i.tween;
    if (o !== n) {
      r = n = o;
      for (var a = 0, s = r.length; a < s; ++a)
        if (r[a].name === e) {
          r = r.slice(), r.splice(a, 1);
          break;
        }
    }
    i.tween = r;
  };
}
function Za(t, e, n) {
  var r, i;
  if (typeof n != "function") throw new Error();
  return function() {
    var o = wt(this, t), a = o.tween;
    if (a !== r) {
      i = (r = a).slice();
      for (var s = { name: e, value: n }, l = 0, u = i.length; l < u; ++l)
        if (i[l].name === e) {
          i[l] = s;
          break;
        }
      l === u && i.push(s);
    }
    o.tween = i;
  };
}
function Ka(t, e) {
  var n = this._id;
  if (t += "", arguments.length < 2) {
    for (var r = pt(this.node(), n).tween, i = 0, o = r.length, a; i < o; ++i)
      if ((a = r[i]).name === t)
        return a.value;
    return null;
  }
  return this.each((e == null ? Ga : Za)(n, t, e));
}
function yn(t, e, n) {
  var r = t._id;
  return t.each(function() {
    var i = wt(this, r);
    (i.value || (i.value = {}))[e] = n.apply(this, arguments);
  }), function(i) {
    return pt(i, r).value[e];
  };
}
function Or(t, e) {
  var n;
  return (typeof e == "number" ? ht : e instanceof zt ? Se : (n = zt(e)) ? (e = n, Se) : Dr)(t, e);
}
function Qa(t) {
  return function() {
    this.removeAttribute(t);
  };
}
function Ja(t) {
  return function() {
    this.removeAttributeNS(t.space, t.local);
  };
}
function ja(t, e, n) {
  var r, i = n + "", o;
  return function() {
    var a = this.getAttribute(t);
    return a === i ? null : a === r ? o : o = e(r = a, n);
  };
}
function ts(t, e, n) {
  var r, i = n + "", o;
  return function() {
    var a = this.getAttributeNS(t.space, t.local);
    return a === i ? null : a === r ? o : o = e(r = a, n);
  };
}
function es(t, e, n) {
  var r, i, o;
  return function() {
    var a, s = n(this), l;
    return s == null ? void this.removeAttribute(t) : (a = this.getAttribute(t), l = s + "", a === l ? null : a === r && l === i ? o : (i = l, o = e(r = a, s)));
  };
}
function ns(t, e, n) {
  var r, i, o;
  return function() {
    var a, s = n(this), l;
    return s == null ? void this.removeAttributeNS(t.space, t.local) : (a = this.getAttributeNS(t.space, t.local), l = s + "", a === l ? null : a === r && l === i ? o : (i = l, o = e(r = a, s)));
  };
}
function rs(t, e) {
  var n = Ue(t), r = n === "transform" ? za : Or;
  return this.attrTween(t, typeof e == "function" ? (n.local ? ns : es)(n, r, yn(this, "attr." + t, e)) : e == null ? (n.local ? Ja : Qa)(n) : (n.local ? ts : ja)(n, r, e));
}
function is(t, e) {
  return function(n) {
    this.setAttribute(t, e.call(this, n));
  };
}
function os(t, e) {
  return function(n) {
    this.setAttributeNS(t.space, t.local, e.call(this, n));
  };
}
function as(t, e) {
  var n, r;
  function i() {
    var o = e.apply(this, arguments);
    return o !== r && (n = (r = o) && os(t, o)), n;
  }
  return i._value = e, i;
}
function ss(t, e) {
  var n, r;
  function i() {
    var o = e.apply(this, arguments);
    return o !== r && (n = (r = o) && is(t, o)), n;
  }
  return i._value = e, i;
}
function us(t, e) {
  var n = "attr." + t;
  if (arguments.length < 2) return (n = this.tween(n)) && n._value;
  if (e == null) return this.tween(n, null);
  if (typeof e != "function") throw new Error();
  var r = Ue(t);
  return this.tween(n, (r.local ? as : ss)(r, e));
}
function ls(t, e) {
  return function() {
    mn(this, t).delay = +e.apply(this, arguments);
  };
}
function cs(t, e) {
  return e = +e, function() {
    mn(this, t).delay = e;
  };
}
function fs(t) {
  var e = this._id;
  return arguments.length ? this.each((typeof t == "function" ? ls : cs)(e, t)) : pt(this.node(), e).delay;
}
function hs(t, e) {
  return function() {
    wt(this, t).duration = +e.apply(this, arguments);
  };
}
function ds(t, e) {
  return e = +e, function() {
    wt(this, t).duration = e;
  };
}
function ps(t) {
  var e = this._id;
  return arguments.length ? this.each((typeof t == "function" ? hs : ds)(e, t)) : pt(this.node(), e).duration;
}
function gs(t, e) {
  if (typeof e != "function") throw new Error();
  return function() {
    wt(this, t).ease = e;
  };
}
function ms(t) {
  var e = this._id;
  return arguments.length ? this.each(gs(e, t)) : pt(this.node(), e).ease;
}
function ys(t, e) {
  return function() {
    var n = e.apply(this, arguments);
    if (typeof n != "function") throw new Error();
    wt(this, t).ease = n;
  };
}
function vs(t) {
  if (typeof t != "function") throw new Error();
  return this.each(ys(this._id, t));
}
function _s(t) {
  typeof t != "function" && (t = yr(t));
  for (var e = this._groups, n = e.length, r = new Array(n), i = 0; i < n; ++i)
    for (var o = e[i], a = o.length, s = r[i] = [], l, u = 0; u < a; ++u)
      (l = o[u]) && t.call(l, l.__data__, u, o) && s.push(l);
  return new At(r, this._parents, this._name, this._id);
}
function xs(t) {
  if (t._id !== this._id) throw new Error();
  for (var e = this._groups, n = t._groups, r = e.length, i = n.length, o = Math.min(r, i), a = new Array(r), s = 0; s < o; ++s)
    for (var l = e[s], u = n[s], c = l.length, g = a[s] = new Array(c), d, v = 0; v < c; ++v)
      (d = l[v] || u[v]) && (g[v] = d);
  for (; s < r; ++s)
    a[s] = e[s];
  return new At(a, this._parents, this._name, this._id);
}
function ws(t) {
  return (t + "").trim().split(/^|\s+/).every(function(e) {
    var n = e.indexOf(".");
    return n >= 0 && (e = e.slice(0, n)), !e || e === "start";
  });
}
function bs(t, e, n) {
  var r, i, o = ws(e) ? mn : wt;
  return function() {
    var a = o(this, t), s = a.on;
    s !== r && (i = (r = s).copy()).on(e, n), a.on = i;
  };
}
function ks(t, e) {
  var n = this._id;
  return arguments.length < 2 ? pt(this.node(), n).on.on(t) : this.each(bs(n, t, e));
}
function Ms(t) {
  return function() {
    var e = this.parentNode;
    for (var n in this.__transition) if (+n !== t) return;
    e && e.removeChild(this);
  };
}
function Cs() {
  return this.on("end.remove", Ms(this._id));
}
function Ts(t) {
  var e = this._name, n = this._id;
  typeof t != "function" && (t = cn(t));
  for (var r = this._groups, i = r.length, o = new Array(i), a = 0; a < i; ++a)
    for (var s = r[a], l = s.length, u = o[a] = new Array(l), c, g, d = 0; d < l; ++d)
      (c = s[d]) && (g = t.call(c, c.__data__, d, s)) && ("__data__" in c && (g.__data__ = c.__data__), u[d] = g, Ie(u[d], e, n, d, u, pt(c, n)));
  return new At(o, this._parents, e, n);
}
function Ss(t) {
  var e = this._name, n = this._id;
  typeof t != "function" && (t = mr(t));
  for (var r = this._groups, i = r.length, o = [], a = [], s = 0; s < i; ++s)
    for (var l = r[s], u = l.length, c, g = 0; g < u; ++g)
      if (c = l[g]) {
        for (var d = t.call(c, c.__data__, g, l), v, L = pt(c, n), $ = 0, G = d.length; $ < G; ++$)
          (v = d[$]) && Ie(v, e, n, $, d, L);
        o.push(d), a.push(c);
      }
  return new At(o, a, e, n);
}
var As = fe.prototype.constructor;
function Es() {
  return new As(this._groups, this._parents);
}
function Ds(t, e) {
  var n, r, i;
  return function() {
    var o = Bt(this, t), a = (this.style.removeProperty(t), Bt(this, t));
    return o === a ? null : o === n && a === r ? i : i = e(n = o, r = a);
  };
}
function $r(t) {
  return function() {
    this.style.removeProperty(t);
  };
}
function Ns(t, e, n) {
  var r, i = n + "", o;
  return function() {
    var a = Bt(this, t);
    return a === i ? null : a === r ? o : o = e(r = a, n);
  };
}
function Rs(t, e, n) {
  var r, i, o;
  return function() {
    var a = Bt(this, t), s = n(this), l = s + "";
    return s == null && (l = s = (this.style.removeProperty(t), Bt(this, t))), a === l ? null : a === r && l === i ? o : (i = l, o = e(r = a, s));
  };
}
function Fs(t, e) {
  var n, r, i, o = "style." + e, a = "end." + o, s;
  return function() {
    var l = wt(this, t), u = l.on, c = l.value[o] == null ? s || (s = $r(e)) : void 0;
    (u !== n || i !== c) && (r = (n = u).copy()).on(a, i = c), l.on = r;
  };
}
function Us(t, e, n) {
  var r = (t += "") == "transform" ? Ua : Or;
  return e == null ? this.styleTween(t, Ds(t, r)).on("end.style." + t, $r(t)) : typeof e == "function" ? this.styleTween(t, Rs(t, r, yn(this, "style." + t, e))).each(Fs(this._id, t)) : this.styleTween(t, Ns(t, r, e), n).on("end.style." + t, null);
}
function zs(t, e, n) {
  return function(r) {
    this.style.setProperty(t, e.call(this, r), n);
  };
}
function Is(t, e, n) {
  var r, i;
  function o() {
    var a = e.apply(this, arguments);
    return a !== i && (r = (i = a) && zs(t, a, n)), r;
  }
  return o._value = e, o;
}
function Os(t, e, n) {
  var r = "style." + (t += "");
  if (arguments.length < 2) return (r = this.tween(r)) && r._value;
  if (e == null) return this.tween(r, null);
  if (typeof e != "function") throw new Error();
  return this.tween(r, Is(t, e, n ?? ""));
}
function $s(t) {
  return function() {
    this.textContent = t;
  };
}
function Ls(t) {
  return function() {
    var e = t(this);
    this.textContent = e ?? "";
  };
}
function Hs(t) {
  return this.tween("text", typeof t == "function" ? Ls(yn(this, "text", t)) : $s(t == null ? "" : t + ""));
}
function Ys(t) {
  return function(e) {
    this.textContent = t.call(this, e);
  };
}
function Ps(t) {
  var e, n;
  function r() {
    var i = t.apply(this, arguments);
    return i !== n && (e = (n = i) && Ys(i)), e;
  }
  return r._value = t, r;
}
function Ws(t) {
  var e = "text";
  if (arguments.length < 1) return (e = this.tween(e)) && e._value;
  if (t == null) return this.tween(e, null);
  if (typeof t != "function") throw new Error();
  return this.tween(e, Ps(t));
}
function qs() {
  for (var t = this._name, e = this._id, n = Lr(), r = this._groups, i = r.length, o = 0; o < i; ++o)
    for (var a = r[o], s = a.length, l, u = 0; u < s; ++u)
      if (l = a[u]) {
        var c = pt(l, e);
        Ie(l, t, n, u, a, {
          time: c.time + c.delay + c.duration,
          delay: 0,
          duration: c.duration,
          ease: c.ease
        });
      }
  return new At(r, this._parents, t, n);
}
function Xs() {
  var t, e, n = this, r = n._id, i = n.size();
  return new Promise(function(o, a) {
    var s = { value: a }, l = { value: function() {
      --i === 0 && o();
    } };
    n.each(function() {
      var u = wt(this, r), c = u.on;
      c !== t && (e = (t = c).copy(), e._.cancel.push(s), e._.interrupt.push(s), e._.end.push(l)), u.on = e;
    }), i === 0 && o();
  });
}
var Vs = 0;
function At(t, e, n, r) {
  this._groups = t, this._parents = e, this._name = n, this._id = r;
}
function Lr() {
  return ++Vs;
}
var kt = fe.prototype;
At.prototype = {
  constructor: At,
  select: Ts,
  selectAll: Ss,
  selectChild: kt.selectChild,
  selectChildren: kt.selectChildren,
  filter: _s,
  merge: xs,
  selection: Es,
  transition: qs,
  call: kt.call,
  nodes: kt.nodes,
  node: kt.node,
  size: kt.size,
  empty: kt.empty,
  each: kt.each,
  on: ks,
  attr: rs,
  attrTween: us,
  style: Us,
  styleTween: Os,
  text: Hs,
  textTween: Ws,
  remove: Cs,
  tween: Ka,
  delay: fs,
  duration: ps,
  ease: ms,
  easeVarying: vs,
  end: Xs,
  [Symbol.iterator]: kt[Symbol.iterator]
};
function Bs(t) {
  return ((t *= 2) <= 1 ? t * t * t : (t -= 2) * t * t + 2) / 2;
}
var Gs = {
  time: null,
  // Set on use.
  delay: 0,
  duration: 250,
  ease: Bs
};
function Zs(t, e) {
  for (var n; !(n = t.__transition) || !(n = n[e]); )
    if (!(t = t.parentNode))
      throw new Error(`transition ${e} not found`);
  return n;
}
function Ks(t) {
  var e, n;
  t instanceof At ? (e = t._id, t = t._name) : (e = Lr(), (n = Gs).time = gn(), t = t == null ? null : t + "");
  for (var r = this._groups, i = r.length, o = 0; o < i; ++o)
    for (var a = r[o], s = a.length, l, u = 0; u < s; ++u)
      (l = a[u]) && Ie(l, t, e, u, a, n || Zs(l, e));
  return new At(r, this._parents, t, e);
}
fe.prototype.interrupt = Ba;
fe.prototype.transition = Ks;
function vn(t, e) {
  switch (arguments.length) {
    case 0:
      break;
    case 1:
      this.range(t);
      break;
    default:
      this.range(e).domain(t);
      break;
  }
  return this;
}
const Kn = Symbol("implicit");
function Hr() {
  var t = new Sn(), e = [], n = [], r = Kn;
  function i(o) {
    let a = t.get(o);
    if (a === void 0) {
      if (r !== Kn) return r;
      t.set(o, a = e.push(o) - 1);
    }
    return n[a % n.length];
  }
  return i.domain = function(o) {
    if (!arguments.length) return e.slice();
    e = [], t = new Sn();
    for (const a of o)
      t.has(a) || t.set(a, e.push(a) - 1);
    return i;
  }, i.range = function(o) {
    return arguments.length ? (n = Array.from(o), i) : n.slice();
  }, i.unknown = function(o) {
    return arguments.length ? (r = o, i) : r;
  }, i.copy = function() {
    return Hr(e, n).unknown(r);
  }, vn.apply(i, arguments), i;
}
function Yr() {
  var t = Hr().unknown(void 0), e = t.domain, n = t.range, r = 0, i = 1, o, a, s = !1, l = 0, u = 0, c = 0.5;
  delete t.unknown;
  function g() {
    var d = e().length, v = i < r, L = v ? i : r, $ = v ? r : i;
    o = ($ - L) / Math.max(1, d - l + u * 2), s && (o = Math.floor(o)), L += ($ - L - o * (d - l)) * c, a = o * (1 - l), s && (L = Math.round(L), a = Math.round(a));
    var G = yi(d).map(function(S) {
      return L + o * S;
    });
    return n(v ? G.reverse() : G);
  }
  return t.domain = function(d) {
    return arguments.length ? (e(d), g()) : e();
  }, t.range = function(d) {
    return arguments.length ? ([r, i] = d, r = +r, i = +i, g()) : [r, i];
  }, t.rangeRound = function(d) {
    return [r, i] = d, r = +r, i = +i, s = !0, g();
  }, t.bandwidth = function() {
    return a;
  }, t.step = function() {
    return o;
  }, t.round = function(d) {
    return arguments.length ? (s = !!d, g()) : s;
  }, t.padding = function(d) {
    return arguments.length ? (l = Math.min(1, u = +d), g()) : l;
  }, t.paddingInner = function(d) {
    return arguments.length ? (l = Math.min(1, d), g()) : l;
  }, t.paddingOuter = function(d) {
    return arguments.length ? (u = +d, g()) : u;
  }, t.align = function(d) {
    return arguments.length ? (c = Math.max(0, Math.min(1, d)), g()) : c;
  }, t.copy = function() {
    return Yr(e(), [r, i]).round(s).paddingInner(l).paddingOuter(u).align(c);
  }, vn.apply(g(), arguments);
}
function Pr(t) {
  var e = t.copy;
  return t.padding = t.paddingOuter, delete t.paddingInner, delete t.paddingOuter, t.copy = function() {
    return Pr(e());
  }, t;
}
function Qn() {
  return Pr(Yr.apply(null, arguments).paddingInner(1));
}
function Qs(t) {
  return function() {
    return t;
  };
}
function Js(t) {
  return +t;
}
var Jn = [0, 1];
function qt(t) {
  return t;
}
function sn(t, e) {
  return (e -= t = +t) ? function(n) {
    return (n - t) / e;
  } : Qs(isNaN(e) ? NaN : 0.5);
}
function js(t, e) {
  var n;
  return t > e && (n = t, t = e, e = n), function(r) {
    return Math.max(t, Math.min(e, r));
  };
}
function tu(t, e, n) {
  var r = t[0], i = t[1], o = e[0], a = e[1];
  return i < r ? (r = sn(i, r), o = n(a, o)) : (r = sn(r, i), o = n(o, a)), function(s) {
    return o(r(s));
  };
}
function eu(t, e, n) {
  var r = Math.min(t.length, e.length) - 1, i = new Array(r), o = new Array(r), a = -1;
  for (t[r] < t[0] && (t = t.slice().reverse(), e = e.slice().reverse()); ++a < r; )
    i[a] = sn(t[a], t[a + 1]), o[a] = n(e[a], e[a + 1]);
  return function(s) {
    var l = ci(t, s, 1, r) - 1;
    return o[l](i[l](s));
  };
}
function nu(t, e) {
  return e.domain(t.domain()).range(t.range()).interpolate(t.interpolate()).clamp(t.clamp()).unknown(t.unknown());
}
function ru() {
  var t = Jn, e = Jn, n = pn, r, i, o, a = qt, s, l, u;
  function c() {
    var d = Math.min(t.length, e.length);
    return a !== qt && (a = js(t[0], t[d - 1])), s = d > 2 ? eu : tu, l = u = null, g;
  }
  function g(d) {
    return d == null || isNaN(d = +d) ? o : (l || (l = s(t.map(r), e, n)))(r(a(d)));
  }
  return g.invert = function(d) {
    return a(i((u || (u = s(e, t.map(r), ht)))(d)));
  }, g.domain = function(d) {
    return arguments.length ? (t = Array.from(d, Js), c()) : t.slice();
  }, g.range = function(d) {
    return arguments.length ? (e = Array.from(d), c()) : e.slice();
  }, g.rangeRound = function(d) {
    return e = Array.from(d), n = Na, c();
  }, g.clamp = function(d) {
    return arguments.length ? (a = d ? !0 : qt, c()) : a !== qt;
  }, g.interpolate = function(d) {
    return arguments.length ? (n = d, c()) : n;
  }, g.unknown = function(d) {
    return arguments.length ? (o = d, g) : o;
  }, function(d, v) {
    return r = d, i = v, c();
  };
}
function iu() {
  return ru()(qt, qt);
}
function ou(t, e) {
  t = t.slice();
  var n = 0, r = t.length - 1, i = t[n], o = t[r], a;
  return o < i && (a = n, n = r, r = a, a = i, i = o, o = a), t[n] = e.floor(i), t[r] = e.ceil(o), t;
}
const qe = /* @__PURE__ */ new Date(), Xe = /* @__PURE__ */ new Date();
function rt(t, e, n, r) {
  function i(o) {
    return t(o = arguments.length === 0 ? /* @__PURE__ */ new Date() : /* @__PURE__ */ new Date(+o)), o;
  }
  return i.floor = (o) => (t(o = /* @__PURE__ */ new Date(+o)), o), i.ceil = (o) => (t(o = new Date(o - 1)), e(o, 1), t(o), o), i.round = (o) => {
    const a = i(o), s = i.ceil(o);
    return o - a < s - o ? a : s;
  }, i.offset = (o, a) => (e(o = /* @__PURE__ */ new Date(+o), a == null ? 1 : Math.floor(a)), o), i.range = (o, a, s) => {
    const l = [];
    if (o = i.ceil(o), s = s == null ? 1 : Math.floor(s), !(o < a) || !(s > 0)) return l;
    let u;
    do
      l.push(u = /* @__PURE__ */ new Date(+o)), e(o, s), t(o);
    while (u < o && o < a);
    return l;
  }, i.filter = (o) => rt((a) => {
    if (a >= a) for (; t(a), !o(a); ) a.setTime(a - 1);
  }, (a, s) => {
    if (a >= a)
      if (s < 0) for (; ++s <= 0; )
        for (; e(a, -1), !o(a); )
          ;
      else for (; --s >= 0; )
        for (; e(a, 1), !o(a); )
          ;
  }), n && (i.count = (o, a) => (qe.setTime(+o), Xe.setTime(+a), t(qe), t(Xe), Math.floor(n(qe, Xe))), i.every = (o) => (o = Math.floor(o), !isFinite(o) || !(o > 0) ? null : o > 1 ? i.filter(r ? (a) => r(a) % o === 0 : (a) => i.count(0, a) % o === 0) : i)), i;
}
const Ne = rt(() => {
}, (t, e) => {
  t.setTime(+t + e);
}, (t, e) => e - t);
Ne.every = (t) => (t = Math.floor(t), !isFinite(t) || !(t > 0) ? null : t > 1 ? rt((e) => {
  e.setTime(Math.floor(e / t) * t);
}, (e, n) => {
  e.setTime(+e + n * t);
}, (e, n) => (n - e) / t) : Ne);
Ne.range;
const Ct = 1e3, ft = Ct * 60, Tt = ft * 60, Et = Tt * 24, _n = Et * 7, jn = Et * 30, Ve = Et * 365, Xt = rt((t) => {
  t.setTime(t - t.getMilliseconds());
}, (t, e) => {
  t.setTime(+t + e * Ct);
}, (t, e) => (e - t) / Ct, (t) => t.getUTCSeconds());
Xt.range;
const xn = rt((t) => {
  t.setTime(t - t.getMilliseconds() - t.getSeconds() * Ct);
}, (t, e) => {
  t.setTime(+t + e * ft);
}, (t, e) => (e - t) / ft, (t) => t.getMinutes());
xn.range;
const au = rt((t) => {
  t.setUTCSeconds(0, 0);
}, (t, e) => {
  t.setTime(+t + e * ft);
}, (t, e) => (e - t) / ft, (t) => t.getUTCMinutes());
au.range;
const wn = rt((t) => {
  t.setTime(t - t.getMilliseconds() - t.getSeconds() * Ct - t.getMinutes() * ft);
}, (t, e) => {
  t.setTime(+t + e * Tt);
}, (t, e) => (e - t) / Tt, (t) => t.getHours());
wn.range;
const su = rt((t) => {
  t.setUTCMinutes(0, 0, 0);
}, (t, e) => {
  t.setTime(+t + e * Tt);
}, (t, e) => (e - t) / Tt, (t) => t.getUTCHours());
su.range;
const de = rt(
  (t) => t.setHours(0, 0, 0, 0),
  (t, e) => t.setDate(t.getDate() + e),
  (t, e) => (e - t - (e.getTimezoneOffset() - t.getTimezoneOffset()) * ft) / Et,
  (t) => t.getDate() - 1
);
de.range;
const bn = rt((t) => {
  t.setUTCHours(0, 0, 0, 0);
}, (t, e) => {
  t.setUTCDate(t.getUTCDate() + e);
}, (t, e) => (e - t) / Et, (t) => t.getUTCDate() - 1);
bn.range;
const uu = rt((t) => {
  t.setUTCHours(0, 0, 0, 0);
}, (t, e) => {
  t.setUTCDate(t.getUTCDate() + e);
}, (t, e) => (e - t) / Et, (t) => Math.floor(t / Et));
uu.range;
function $t(t) {
  return rt((e) => {
    e.setDate(e.getDate() - (e.getDay() + 7 - t) % 7), e.setHours(0, 0, 0, 0);
  }, (e, n) => {
    e.setDate(e.getDate() + n * 7);
  }, (e, n) => (n - e - (n.getTimezoneOffset() - e.getTimezoneOffset()) * ft) / _n);
}
const Oe = $t(0), Re = $t(1), lu = $t(2), cu = $t(3), Zt = $t(4), fu = $t(5), hu = $t(6);
Oe.range;
Re.range;
lu.range;
cu.range;
Zt.range;
fu.range;
hu.range;
function Lt(t) {
  return rt((e) => {
    e.setUTCDate(e.getUTCDate() - (e.getUTCDay() + 7 - t) % 7), e.setUTCHours(0, 0, 0, 0);
  }, (e, n) => {
    e.setUTCDate(e.getUTCDate() + n * 7);
  }, (e, n) => (n - e) / _n);
}
const Wr = Lt(0), Fe = Lt(1), du = Lt(2), pu = Lt(3), Kt = Lt(4), gu = Lt(5), mu = Lt(6);
Wr.range;
Fe.range;
du.range;
pu.range;
Kt.range;
gu.range;
mu.range;
const kn = rt((t) => {
  t.setDate(1), t.setHours(0, 0, 0, 0);
}, (t, e) => {
  t.setMonth(t.getMonth() + e);
}, (t, e) => e.getMonth() - t.getMonth() + (e.getFullYear() - t.getFullYear()) * 12, (t) => t.getMonth());
kn.range;
const yu = rt((t) => {
  t.setUTCDate(1), t.setUTCHours(0, 0, 0, 0);
}, (t, e) => {
  t.setUTCMonth(t.getUTCMonth() + e);
}, (t, e) => e.getUTCMonth() - t.getUTCMonth() + (e.getUTCFullYear() - t.getUTCFullYear()) * 12, (t) => t.getUTCMonth());
yu.range;
const Dt = rt((t) => {
  t.setMonth(0, 1), t.setHours(0, 0, 0, 0);
}, (t, e) => {
  t.setFullYear(t.getFullYear() + e);
}, (t, e) => e.getFullYear() - t.getFullYear(), (t) => t.getFullYear());
Dt.every = (t) => !isFinite(t = Math.floor(t)) || !(t > 0) ? null : rt((e) => {
  e.setFullYear(Math.floor(e.getFullYear() / t) * t), e.setMonth(0, 1), e.setHours(0, 0, 0, 0);
}, (e, n) => {
  e.setFullYear(e.getFullYear() + n * t);
});
Dt.range;
const Ot = rt((t) => {
  t.setUTCMonth(0, 1), t.setUTCHours(0, 0, 0, 0);
}, (t, e) => {
  t.setUTCFullYear(t.getUTCFullYear() + e);
}, (t, e) => e.getUTCFullYear() - t.getUTCFullYear(), (t) => t.getUTCFullYear());
Ot.every = (t) => !isFinite(t = Math.floor(t)) || !(t > 0) ? null : rt((e) => {
  e.setUTCFullYear(Math.floor(e.getUTCFullYear() / t) * t), e.setUTCMonth(0, 1), e.setUTCHours(0, 0, 0, 0);
}, (e, n) => {
  e.setUTCFullYear(e.getUTCFullYear() + n * t);
});
Ot.range;
function vu(t, e, n, r, i, o) {
  const a = [
    [Xt, 1, Ct],
    [Xt, 5, 5 * Ct],
    [Xt, 15, 15 * Ct],
    [Xt, 30, 30 * Ct],
    [o, 1, ft],
    [o, 5, 5 * ft],
    [o, 15, 15 * ft],
    [o, 30, 30 * ft],
    [i, 1, Tt],
    [i, 3, 3 * Tt],
    [i, 6, 6 * Tt],
    [i, 12, 12 * Tt],
    [r, 1, Et],
    [r, 2, 2 * Et],
    [n, 1, _n],
    [e, 1, jn],
    [e, 3, 3 * jn],
    [t, 1, Ve]
  ];
  function s(u, c, g) {
    const d = c < u;
    d && ([u, c] = [c, u]);
    const v = g && typeof g.range == "function" ? g : l(u, c, g), L = v ? v.range(u, +c + 1) : [];
    return d ? L.reverse() : L;
  }
  function l(u, c, g) {
    const d = Math.abs(c - u) / g, v = un(([, , G]) => G).right(a, d);
    if (v === a.length) return t.every(Dn(u / Ve, c / Ve, g));
    if (v === 0) return Ne.every(Math.max(Dn(u, c, g), 1));
    const [L, $] = a[d / a[v - 1][2] < a[v][2] / d ? v - 1 : v];
    return L.every($);
  }
  return [s, l];
}
const [_u, xu] = vu(Dt, kn, Oe, de, wn, xn);
function Be(t) {
  if (0 <= t.y && t.y < 100) {
    var e = new Date(-1, t.m, t.d, t.H, t.M, t.S, t.L);
    return e.setFullYear(t.y), e;
  }
  return new Date(t.y, t.m, t.d, t.H, t.M, t.S, t.L);
}
function Ge(t) {
  if (0 <= t.y && t.y < 100) {
    var e = new Date(Date.UTC(-1, t.m, t.d, t.H, t.M, t.S, t.L));
    return e.setUTCFullYear(t.y), e;
  }
  return new Date(Date.UTC(t.y, t.m, t.d, t.H, t.M, t.S, t.L));
}
function ee(t, e, n) {
  return { y: t, m: e, d: n, H: 0, M: 0, S: 0, L: 0 };
}
function wu(t) {
  var e = t.dateTime, n = t.date, r = t.time, i = t.periods, o = t.days, a = t.shortDays, s = t.months, l = t.shortMonths, u = ne(i), c = re(i), g = ne(o), d = re(o), v = ne(a), L = re(a), $ = ne(s), G = re(s), S = ne(l), tt = re(l), Z = {
    a: k,
    A: U,
    b: C,
    B: Y,
    c: null,
    d: or,
    e: or,
    f: qu,
    g: tl,
    G: nl,
    H: Yu,
    I: Pu,
    j: Wu,
    L: qr,
    m: Xu,
    M: Vu,
    p: R,
    q: I,
    Q: ur,
    s: lr,
    S: Bu,
    u: Gu,
    U: Zu,
    V: Ku,
    w: Qu,
    W: Ju,
    x: null,
    X: null,
    y: ju,
    Y: el,
    Z: rl,
    "%": sr
  }, H = {
    a: F,
    A: B,
    b: Q,
    B: J,
    c: null,
    d: ar,
    e: ar,
    f: sl,
    g: yl,
    G: _l,
    H: il,
    I: ol,
    j: al,
    L: Vr,
    m: ul,
    M: ll,
    p: T,
    q: _,
    Q: ur,
    s: lr,
    S: cl,
    u: fl,
    U: hl,
    V: dl,
    w: pl,
    W: gl,
    x: null,
    X: null,
    y: ml,
    Y: vl,
    Z: xl,
    "%": sr
  }, K = {
    a: x,
    A: E,
    b: D,
    B: W,
    c: p,
    d: rr,
    e: rr,
    f: Ou,
    g: nr,
    G: er,
    H: ir,
    I: ir,
    j: Fu,
    L: Iu,
    m: Ru,
    M: Uu,
    p: h,
    q: Nu,
    Q: Lu,
    s: Hu,
    S: zu,
    u: Tu,
    U: Su,
    V: Au,
    w: Cu,
    W: Eu,
    x: N,
    X: b,
    y: nr,
    Y: er,
    Z: Du,
    "%": $u
  };
  Z.x = A(n, Z), Z.X = A(r, Z), Z.c = A(e, Z), H.x = A(n, H), H.X = A(r, H), H.c = A(e, H);
  function A(y, M) {
    return function(w) {
      var m = [], P = -1, O = 0, V = y.length, q, nt, X;
      for (w instanceof Date || (w = /* @__PURE__ */ new Date(+w)); ++P < V; )
        y.charCodeAt(P) === 37 && (m.push(y.slice(O, P)), (nt = tr[q = y.charAt(++P)]) != null ? q = y.charAt(++P) : nt = q === "e" ? " " : "0", (X = M[q]) && (q = X(w, nt)), m.push(q), O = P + 1);
      return m.push(y.slice(O, P)), m.join("");
    };
  }
  function z(y, M) {
    return function(w) {
      var m = ee(1900, void 0, 1), P = f(m, y, w += "", 0), O, V;
      if (P != w.length) return null;
      if ("Q" in m) return new Date(m.Q);
      if ("s" in m) return new Date(m.s * 1e3 + ("L" in m ? m.L : 0));
      if (M && !("Z" in m) && (m.Z = 0), "p" in m && (m.H = m.H % 12 + m.p * 12), m.m === void 0 && (m.m = "q" in m ? m.q : 0), "V" in m) {
        if (m.V < 1 || m.V > 53) return null;
        "w" in m || (m.w = 1), "Z" in m ? (O = Ge(ee(m.y, 0, 1)), V = O.getUTCDay(), O = V > 4 || V === 0 ? Fe.ceil(O) : Fe(O), O = bn.offset(O, (m.V - 1) * 7), m.y = O.getUTCFullYear(), m.m = O.getUTCMonth(), m.d = O.getUTCDate() + (m.w + 6) % 7) : (O = Be(ee(m.y, 0, 1)), V = O.getDay(), O = V > 4 || V === 0 ? Re.ceil(O) : Re(O), O = de.offset(O, (m.V - 1) * 7), m.y = O.getFullYear(), m.m = O.getMonth(), m.d = O.getDate() + (m.w + 6) % 7);
      } else ("W" in m || "U" in m) && ("w" in m || (m.w = "u" in m ? m.u % 7 : "W" in m ? 1 : 0), V = "Z" in m ? Ge(ee(m.y, 0, 1)).getUTCDay() : Be(ee(m.y, 0, 1)).getDay(), m.m = 0, m.d = "W" in m ? (m.w + 6) % 7 + m.W * 7 - (V + 5) % 7 : m.w + m.U * 7 - (V + 6) % 7);
      return "Z" in m ? (m.H += m.Z / 100 | 0, m.M += m.Z % 100, Ge(m)) : Be(m);
    };
  }
  function f(y, M, w, m) {
    for (var P = 0, O = M.length, V = w.length, q, nt; P < O; ) {
      if (m >= V) return -1;
      if (q = M.charCodeAt(P++), q === 37) {
        if (q = M.charAt(P++), nt = K[q in tr ? M.charAt(P++) : q], !nt || (m = nt(y, w, m)) < 0) return -1;
      } else if (q != w.charCodeAt(m++))
        return -1;
    }
    return m;
  }
  function h(y, M, w) {
    var m = u.exec(M.slice(w));
    return m ? (y.p = c.get(m[0].toLowerCase()), w + m[0].length) : -1;
  }
  function x(y, M, w) {
    var m = v.exec(M.slice(w));
    return m ? (y.w = L.get(m[0].toLowerCase()), w + m[0].length) : -1;
  }
  function E(y, M, w) {
    var m = g.exec(M.slice(w));
    return m ? (y.w = d.get(m[0].toLowerCase()), w + m[0].length) : -1;
  }
  function D(y, M, w) {
    var m = S.exec(M.slice(w));
    return m ? (y.m = tt.get(m[0].toLowerCase()), w + m[0].length) : -1;
  }
  function W(y, M, w) {
    var m = $.exec(M.slice(w));
    return m ? (y.m = G.get(m[0].toLowerCase()), w + m[0].length) : -1;
  }
  function p(y, M, w) {
    return f(y, e, M, w);
  }
  function N(y, M, w) {
    return f(y, n, M, w);
  }
  function b(y, M, w) {
    return f(y, r, M, w);
  }
  function k(y) {
    return a[y.getDay()];
  }
  function U(y) {
    return o[y.getDay()];
  }
  function C(y) {
    return l[y.getMonth()];
  }
  function Y(y) {
    return s[y.getMonth()];
  }
  function R(y) {
    return i[+(y.getHours() >= 12)];
  }
  function I(y) {
    return 1 + ~~(y.getMonth() / 3);
  }
  function F(y) {
    return a[y.getUTCDay()];
  }
  function B(y) {
    return o[y.getUTCDay()];
  }
  function Q(y) {
    return l[y.getUTCMonth()];
  }
  function J(y) {
    return s[y.getUTCMonth()];
  }
  function T(y) {
    return i[+(y.getUTCHours() >= 12)];
  }
  function _(y) {
    return 1 + ~~(y.getUTCMonth() / 3);
  }
  return {
    format: function(y) {
      var M = A(y += "", Z);
      return M.toString = function() {
        return y;
      }, M;
    },
    parse: function(y) {
      var M = z(y += "", !1);
      return M.toString = function() {
        return y;
      }, M;
    },
    utcFormat: function(y) {
      var M = A(y += "", H);
      return M.toString = function() {
        return y;
      }, M;
    },
    utcParse: function(y) {
      var M = z(y += "", !0);
      return M.toString = function() {
        return y;
      }, M;
    }
  };
}
var tr = { "-": "", _: " ", 0: "0" }, ot = /^\s*\d+/, bu = /^%/, ku = /[\\^$*+?|[\]().{}]/g;
function j(t, e, n) {
  var r = t < 0 ? "-" : "", i = (r ? -t : t) + "", o = i.length;
  return r + (o < n ? new Array(n - o + 1).join(e) + i : i);
}
function Mu(t) {
  return t.replace(ku, "\\$&");
}
function ne(t) {
  return new RegExp("^(?:" + t.map(Mu).join("|") + ")", "i");
}
function re(t) {
  return new Map(t.map((e, n) => [e.toLowerCase(), n]));
}
function Cu(t, e, n) {
  var r = ot.exec(e.slice(n, n + 1));
  return r ? (t.w = +r[0], n + r[0].length) : -1;
}
function Tu(t, e, n) {
  var r = ot.exec(e.slice(n, n + 1));
  return r ? (t.u = +r[0], n + r[0].length) : -1;
}
function Su(t, e, n) {
  var r = ot.exec(e.slice(n, n + 2));
  return r ? (t.U = +r[0], n + r[0].length) : -1;
}
function Au(t, e, n) {
  var r = ot.exec(e.slice(n, n + 2));
  return r ? (t.V = +r[0], n + r[0].length) : -1;
}
function Eu(t, e, n) {
  var r = ot.exec(e.slice(n, n + 2));
  return r ? (t.W = +r[0], n + r[0].length) : -1;
}
function er(t, e, n) {
  var r = ot.exec(e.slice(n, n + 4));
  return r ? (t.y = +r[0], n + r[0].length) : -1;
}
function nr(t, e, n) {
  var r = ot.exec(e.slice(n, n + 2));
  return r ? (t.y = +r[0] + (+r[0] > 68 ? 1900 : 2e3), n + r[0].length) : -1;
}
function Du(t, e, n) {
  var r = /^(Z)|([+-]\d\d)(?::?(\d\d))?/.exec(e.slice(n, n + 6));
  return r ? (t.Z = r[1] ? 0 : -(r[2] + (r[3] || "00")), n + r[0].length) : -1;
}
function Nu(t, e, n) {
  var r = ot.exec(e.slice(n, n + 1));
  return r ? (t.q = r[0] * 3 - 3, n + r[0].length) : -1;
}
function Ru(t, e, n) {
  var r = ot.exec(e.slice(n, n + 2));
  return r ? (t.m = r[0] - 1, n + r[0].length) : -1;
}
function rr(t, e, n) {
  var r = ot.exec(e.slice(n, n + 2));
  return r ? (t.d = +r[0], n + r[0].length) : -1;
}
function Fu(t, e, n) {
  var r = ot.exec(e.slice(n, n + 3));
  return r ? (t.m = 0, t.d = +r[0], n + r[0].length) : -1;
}
function ir(t, e, n) {
  var r = ot.exec(e.slice(n, n + 2));
  return r ? (t.H = +r[0], n + r[0].length) : -1;
}
function Uu(t, e, n) {
  var r = ot.exec(e.slice(n, n + 2));
  return r ? (t.M = +r[0], n + r[0].length) : -1;
}
function zu(t, e, n) {
  var r = ot.exec(e.slice(n, n + 2));
  return r ? (t.S = +r[0], n + r[0].length) : -1;
}
function Iu(t, e, n) {
  var r = ot.exec(e.slice(n, n + 3));
  return r ? (t.L = +r[0], n + r[0].length) : -1;
}
function Ou(t, e, n) {
  var r = ot.exec(e.slice(n, n + 6));
  return r ? (t.L = Math.floor(r[0] / 1e3), n + r[0].length) : -1;
}
function $u(t, e, n) {
  var r = bu.exec(e.slice(n, n + 1));
  return r ? n + r[0].length : -1;
}
function Lu(t, e, n) {
  var r = ot.exec(e.slice(n));
  return r ? (t.Q = +r[0], n + r[0].length) : -1;
}
function Hu(t, e, n) {
  var r = ot.exec(e.slice(n));
  return r ? (t.s = +r[0], n + r[0].length) : -1;
}
function or(t, e) {
  return j(t.getDate(), e, 2);
}
function Yu(t, e) {
  return j(t.getHours(), e, 2);
}
function Pu(t, e) {
  return j(t.getHours() % 12 || 12, e, 2);
}
function Wu(t, e) {
  return j(1 + de.count(Dt(t), t), e, 3);
}
function qr(t, e) {
  return j(t.getMilliseconds(), e, 3);
}
function qu(t, e) {
  return qr(t, e) + "000";
}
function Xu(t, e) {
  return j(t.getMonth() + 1, e, 2);
}
function Vu(t, e) {
  return j(t.getMinutes(), e, 2);
}
function Bu(t, e) {
  return j(t.getSeconds(), e, 2);
}
function Gu(t) {
  var e = t.getDay();
  return e === 0 ? 7 : e;
}
function Zu(t, e) {
  return j(Oe.count(Dt(t) - 1, t), e, 2);
}
function Xr(t) {
  var e = t.getDay();
  return e >= 4 || e === 0 ? Zt(t) : Zt.ceil(t);
}
function Ku(t, e) {
  return t = Xr(t), j(Zt.count(Dt(t), t) + (Dt(t).getDay() === 4), e, 2);
}
function Qu(t) {
  return t.getDay();
}
function Ju(t, e) {
  return j(Re.count(Dt(t) - 1, t), e, 2);
}
function ju(t, e) {
  return j(t.getFullYear() % 100, e, 2);
}
function tl(t, e) {
  return t = Xr(t), j(t.getFullYear() % 100, e, 2);
}
function el(t, e) {
  return j(t.getFullYear() % 1e4, e, 4);
}
function nl(t, e) {
  var n = t.getDay();
  return t = n >= 4 || n === 0 ? Zt(t) : Zt.ceil(t), j(t.getFullYear() % 1e4, e, 4);
}
function rl(t) {
  var e = t.getTimezoneOffset();
  return (e > 0 ? "-" : (e *= -1, "+")) + j(e / 60 | 0, "0", 2) + j(e % 60, "0", 2);
}
function ar(t, e) {
  return j(t.getUTCDate(), e, 2);
}
function il(t, e) {
  return j(t.getUTCHours(), e, 2);
}
function ol(t, e) {
  return j(t.getUTCHours() % 12 || 12, e, 2);
}
function al(t, e) {
  return j(1 + bn.count(Ot(t), t), e, 3);
}
function Vr(t, e) {
  return j(t.getUTCMilliseconds(), e, 3);
}
function sl(t, e) {
  return Vr(t, e) + "000";
}
function ul(t, e) {
  return j(t.getUTCMonth() + 1, e, 2);
}
function ll(t, e) {
  return j(t.getUTCMinutes(), e, 2);
}
function cl(t, e) {
  return j(t.getUTCSeconds(), e, 2);
}
function fl(t) {
  var e = t.getUTCDay();
  return e === 0 ? 7 : e;
}
function hl(t, e) {
  return j(Wr.count(Ot(t) - 1, t), e, 2);
}
function Br(t) {
  var e = t.getUTCDay();
  return e >= 4 || e === 0 ? Kt(t) : Kt.ceil(t);
}
function dl(t, e) {
  return t = Br(t), j(Kt.count(Ot(t), t) + (Ot(t).getUTCDay() === 4), e, 2);
}
function pl(t) {
  return t.getUTCDay();
}
function gl(t, e) {
  return j(Fe.count(Ot(t) - 1, t), e, 2);
}
function ml(t, e) {
  return j(t.getUTCFullYear() % 100, e, 2);
}
function yl(t, e) {
  return t = Br(t), j(t.getUTCFullYear() % 100, e, 2);
}
function vl(t, e) {
  return j(t.getUTCFullYear() % 1e4, e, 4);
}
function _l(t, e) {
  var n = t.getUTCDay();
  return t = n >= 4 || n === 0 ? Kt(t) : Kt.ceil(t), j(t.getUTCFullYear() % 1e4, e, 4);
}
function xl() {
  return "+0000";
}
function sr() {
  return "%";
}
function ur(t) {
  return +t;
}
function lr(t) {
  return Math.floor(+t / 1e3);
}
var Pt, Qt;
wl({
  dateTime: "%x, %X",
  date: "%-m/%-d/%Y",
  time: "%-I:%M:%S %p",
  periods: ["AM", "PM"],
  days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  shortDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  shortMonths: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
});
function wl(t) {
  return Pt = wu(t), Qt = Pt.format, Pt.parse, Pt.utcFormat, Pt.utcParse, Pt;
}
function bl(t) {
  return new Date(t);
}
function kl(t) {
  return t instanceof Date ? +t : +/* @__PURE__ */ new Date(+t);
}
function Gr(t, e, n, r, i, o, a, s, l, u) {
  var c = iu(), g = c.invert, d = c.domain, v = u(".%L"), L = u(":%S"), $ = u("%I:%M"), G = u("%I %p"), S = u("%a %d"), tt = u("%b %d"), Z = u("%B"), H = u("%Y");
  function K(A) {
    return (l(A) < A ? v : s(A) < A ? L : a(A) < A ? $ : o(A) < A ? G : r(A) < A ? i(A) < A ? S : tt : n(A) < A ? Z : H)(A);
  }
  return c.invert = function(A) {
    return new Date(g(A));
  }, c.domain = function(A) {
    return arguments.length ? d(Array.from(A, kl)) : d().map(bl);
  }, c.ticks = function(A) {
    var z = d();
    return t(z[0], z[z.length - 1], A ?? 10);
  }, c.tickFormat = function(A, z) {
    return z == null ? K : u(z);
  }, c.nice = function(A) {
    var z = d();
    return (!A || typeof A.range != "function") && (A = e(z[0], z[z.length - 1], A ?? 10)), A ? d(ou(z, A)) : c;
  }, c.copy = function() {
    return nu(c, Gr(t, e, n, r, i, o, a, s, l, u));
  }, c;
}
function Zr() {
  return vn.apply(Gr(_u, xu, Dt, kn, Oe, de, wn, xn, Xt, Qt).domain([new Date(2e3, 0, 1), new Date(2e3, 0, 2)]), arguments);
}
const ye = (t) => () => t;
function Ml(t, {
  sourceEvent: e,
  target: n,
  transform: r,
  dispatch: i
}) {
  Object.defineProperties(this, {
    type: { value: t, enumerable: !0, configurable: !0 },
    sourceEvent: { value: e, enumerable: !0, configurable: !0 },
    target: { value: n, enumerable: !0, configurable: !0 },
    transform: { value: r, enumerable: !0, configurable: !0 },
    _: { value: i }
  });
}
function St(t, e, n) {
  this.k = t, this.x = e, this.y = n;
}
St.prototype = {
  constructor: St,
  scale: function(t) {
    return t === 1 ? this : new St(this.k * t, this.x, this.y);
  },
  translate: function(t, e) {
    return t === 0 & e === 0 ? this : new St(this.k, this.x + this.k * t, this.y + this.k * e);
  },
  apply: function(t) {
    return [t[0] * this.k + this.x, t[1] * this.k + this.y];
  },
  applyX: function(t) {
    return t * this.k + this.x;
  },
  applyY: function(t) {
    return t * this.k + this.y;
  },
  invert: function(t) {
    return [(t[0] - this.x) / this.k, (t[1] - this.y) / this.k];
  },
  invertX: function(t) {
    return (t - this.x) / this.k;
  },
  invertY: function(t) {
    return (t - this.y) / this.k;
  },
  rescaleX: function(t) {
    return t.copy().domain(t.range().map(this.invertX, this).map(t.invert, t));
  },
  rescaleY: function(t) {
    return t.copy().domain(t.range().map(this.invertY, this).map(t.invert, t));
  },
  toString: function() {
    return "translate(" + this.x + "," + this.y + ") scale(" + this.k + ")";
  }
};
var Mt = new St(1, 0, 0);
St.prototype;
function Ze(t) {
  t.stopImmediatePropagation();
}
function ie(t) {
  t.preventDefault(), t.stopImmediatePropagation();
}
function Cl(t) {
  return (!t.ctrlKey || t.type === "wheel") && !t.button;
}
function Tl() {
  var t = this;
  return t instanceof SVGElement ? (t = t.ownerSVGElement || t, t.hasAttribute("viewBox") ? (t = t.viewBox.baseVal, [[t.x, t.y], [t.x + t.width, t.y + t.height]]) : [[0, 0], [t.width.baseVal.value, t.height.baseVal.value]]) : [[0, 0], [t.clientWidth, t.clientHeight]];
}
function cr() {
  return this.__zoom || Mt;
}
function Sl(t) {
  return -t.deltaY * (t.deltaMode === 1 ? 0.05 : t.deltaMode ? 1 : 2e-3) * (t.ctrlKey ? 10 : 1);
}
function Al() {
  return navigator.maxTouchPoints || "ontouchstart" in this;
}
function El(t, e, n) {
  var r = t.invertX(e[0][0]) - n[0][0], i = t.invertX(e[1][0]) - n[1][0], o = t.invertY(e[0][1]) - n[0][1], a = t.invertY(e[1][1]) - n[1][1];
  return t.translate(
    i > r ? (r + i) / 2 : Math.min(0, r) || Math.max(0, i),
    a > o ? (o + a) / 2 : Math.min(0, o) || Math.max(0, a)
  );
}
function Kr() {
  var t = Cl, e = Tl, n = El, r = Sl, i = Al, o = [0, 1 / 0], a = [[-1 / 0, -1 / 0], [1 / 0, 1 / 0]], s = 250, l = La, u = ln("start", "zoom", "end"), c, g, d, v = 500, L = 150, $ = 0, G = 10;
  function S(p) {
    p.property("__zoom", cr).on("wheel.zoom", f, { passive: !1 }).on("mousedown.zoom", h).on("dblclick.zoom", x).filter(i).on("touchstart.zoom", E).on("touchmove.zoom", D).on("touchend.zoom touchcancel.zoom", W).style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
  }
  S.transform = function(p, N, b, k) {
    var U = p.selection ? p.selection() : p;
    U.property("__zoom", cr), p !== U ? K(p, N, b, k) : U.interrupt().each(function() {
      A(this, arguments).event(k).start().zoom(null, typeof N == "function" ? N.apply(this, arguments) : N).end();
    });
  }, S.scaleBy = function(p, N, b, k) {
    S.scaleTo(p, function() {
      var U = this.__zoom.k, C = typeof N == "function" ? N.apply(this, arguments) : N;
      return U * C;
    }, b, k);
  }, S.scaleTo = function(p, N, b, k) {
    S.transform(p, function() {
      var U = e.apply(this, arguments), C = this.__zoom, Y = b == null ? H(U) : typeof b == "function" ? b.apply(this, arguments) : b, R = C.invert(Y), I = typeof N == "function" ? N.apply(this, arguments) : N;
      return n(Z(tt(C, I), Y, R), U, a);
    }, b, k);
  }, S.translateBy = function(p, N, b, k) {
    S.transform(p, function() {
      return n(this.__zoom.translate(
        typeof N == "function" ? N.apply(this, arguments) : N,
        typeof b == "function" ? b.apply(this, arguments) : b
      ), e.apply(this, arguments), a);
    }, null, k);
  }, S.translateTo = function(p, N, b, k, U) {
    S.transform(p, function() {
      var C = e.apply(this, arguments), Y = this.__zoom, R = k == null ? H(C) : typeof k == "function" ? k.apply(this, arguments) : k;
      return n(Mt.translate(R[0], R[1]).scale(Y.k).translate(
        typeof N == "function" ? -N.apply(this, arguments) : -N,
        typeof b == "function" ? -b.apply(this, arguments) : -b
      ), C, a);
    }, k, U);
  };
  function tt(p, N) {
    return N = Math.max(o[0], Math.min(o[1], N)), N === p.k ? p : new St(N, p.x, p.y);
  }
  function Z(p, N, b) {
    var k = N[0] - b[0] * p.k, U = N[1] - b[1] * p.k;
    return k === p.x && U === p.y ? p : new St(p.k, k, U);
  }
  function H(p) {
    return [(+p[0][0] + +p[1][0]) / 2, (+p[0][1] + +p[1][1]) / 2];
  }
  function K(p, N, b, k) {
    p.on("start.zoom", function() {
      A(this, arguments).event(k).start();
    }).on("interrupt.zoom end.zoom", function() {
      A(this, arguments).event(k).end();
    }).tween("zoom", function() {
      var U = this, C = arguments, Y = A(U, C).event(k), R = e.apply(U, C), I = b == null ? H(R) : typeof b == "function" ? b.apply(U, C) : b, F = Math.max(R[1][0] - R[0][0], R[1][1] - R[0][1]), B = U.__zoom, Q = typeof N == "function" ? N.apply(U, C) : N, J = l(B.invert(I).concat(F / B.k), Q.invert(I).concat(F / Q.k));
      return function(T) {
        if (T === 1) T = Q;
        else {
          var _ = J(T), y = F / _[2];
          T = new St(y, I[0] - _[0] * y, I[1] - _[1] * y);
        }
        Y.zoom(null, T);
      };
    });
  }
  function A(p, N, b) {
    return !b && p.__zooming || new z(p, N);
  }
  function z(p, N) {
    this.that = p, this.args = N, this.active = 0, this.sourceEvent = null, this.extent = e.apply(p, N), this.taps = 0;
  }
  z.prototype = {
    event: function(p) {
      return p && (this.sourceEvent = p), this;
    },
    start: function() {
      return ++this.active === 1 && (this.that.__zooming = this, this.emit("start")), this;
    },
    zoom: function(p, N) {
      return this.mouse && p !== "mouse" && (this.mouse[1] = N.invert(this.mouse[0])), this.touch0 && p !== "touch" && (this.touch0[1] = N.invert(this.touch0[0])), this.touch1 && p !== "touch" && (this.touch1[1] = N.invert(this.touch1[0])), this.that.__zoom = N, this.emit("zoom"), this;
    },
    end: function() {
      return --this.active === 0 && (delete this.that.__zooming, this.emit("end")), this;
    },
    emit: function(p) {
      var N = ct(this.that).datum();
      u.call(
        p,
        this.that,
        new Ml(p, {
          sourceEvent: this.sourceEvent,
          target: S,
          transform: this.that.__zoom,
          dispatch: u
        }),
        N
      );
    }
  };
  function f(p, ...N) {
    if (!t.apply(this, arguments)) return;
    var b = A(this, N).event(p), k = this.__zoom, U = Math.max(o[0], Math.min(o[1], k.k * Math.pow(2, r.apply(this, arguments)))), C = Rt(p);
    if (b.wheel)
      (b.mouse[0][0] !== C[0] || b.mouse[0][1] !== C[1]) && (b.mouse[1] = k.invert(b.mouse[0] = C)), clearTimeout(b.wheel);
    else {
      if (k.k === U) return;
      b.mouse = [C, k.invert(C)], ke(this), b.start();
    }
    ie(p), b.wheel = setTimeout(Y, L), b.zoom("mouse", n(Z(tt(k, U), b.mouse[0], b.mouse[1]), b.extent, a));
    function Y() {
      b.wheel = null, b.end();
    }
  }
  function h(p, ...N) {
    if (d || !t.apply(this, arguments)) return;
    var b = p.currentTarget, k = A(this, N, !0).event(p), U = ct(p.view).on("mousemove.zoom", I, !0).on("mouseup.zoom", F, !0), C = Rt(p, b), Y = p.clientX, R = p.clientY;
    sa(p.view), Ze(p), k.mouse = [C, this.__zoom.invert(C)], ke(this), k.start();
    function I(B) {
      if (ie(B), !k.moved) {
        var Q = B.clientX - Y, J = B.clientY - R;
        k.moved = Q * Q + J * J > $;
      }
      k.event(B).zoom("mouse", n(Z(k.that.__zoom, k.mouse[0] = Rt(B, b), k.mouse[1]), k.extent, a));
    }
    function F(B) {
      U.on("mousemove.zoom mouseup.zoom", null), ua(B.view, k.moved), ie(B), k.event(B).end();
    }
  }
  function x(p, ...N) {
    if (t.apply(this, arguments)) {
      var b = this.__zoom, k = Rt(p.changedTouches ? p.changedTouches[0] : p, this), U = b.invert(k), C = b.k * (p.shiftKey ? 0.5 : 2), Y = n(Z(tt(b, C), k, U), e.apply(this, N), a);
      ie(p), s > 0 ? ct(this).transition().duration(s).call(K, Y, k, p) : ct(this).call(S.transform, Y, k, p);
    }
  }
  function E(p, ...N) {
    if (t.apply(this, arguments)) {
      var b = p.touches, k = b.length, U = A(this, N, p.changedTouches.length === k).event(p), C, Y, R, I;
      for (Ze(p), Y = 0; Y < k; ++Y)
        R = b[Y], I = Rt(R, this), I = [I, this.__zoom.invert(I), R.identifier], U.touch0 ? !U.touch1 && U.touch0[2] !== I[2] && (U.touch1 = I, U.taps = 0) : (U.touch0 = I, C = !0, U.taps = 1 + !!c);
      c && (c = clearTimeout(c)), C && (U.taps < 2 && (g = I[0], c = setTimeout(function() {
        c = null;
      }, v)), ke(this), U.start());
    }
  }
  function D(p, ...N) {
    if (this.__zooming) {
      var b = A(this, N).event(p), k = p.changedTouches, U = k.length, C, Y, R, I;
      for (ie(p), C = 0; C < U; ++C)
        Y = k[C], R = Rt(Y, this), b.touch0 && b.touch0[2] === Y.identifier ? b.touch0[0] = R : b.touch1 && b.touch1[2] === Y.identifier && (b.touch1[0] = R);
      if (Y = b.that.__zoom, b.touch1) {
        var F = b.touch0[0], B = b.touch0[1], Q = b.touch1[0], J = b.touch1[1], T = (T = Q[0] - F[0]) * T + (T = Q[1] - F[1]) * T, _ = (_ = J[0] - B[0]) * _ + (_ = J[1] - B[1]) * _;
        Y = tt(Y, Math.sqrt(T / _)), R = [(F[0] + Q[0]) / 2, (F[1] + Q[1]) / 2], I = [(B[0] + J[0]) / 2, (B[1] + J[1]) / 2];
      } else if (b.touch0) R = b.touch0[0], I = b.touch0[1];
      else return;
      b.zoom("touch", n(Z(Y, R, I), b.extent, a));
    }
  }
  function W(p, ...N) {
    if (this.__zooming) {
      var b = A(this, N).event(p), k = p.changedTouches, U = k.length, C, Y;
      for (Ze(p), d && clearTimeout(d), d = setTimeout(function() {
        d = null;
      }, v), C = 0; C < U; ++C)
        Y = k[C], b.touch0 && b.touch0[2] === Y.identifier ? delete b.touch0 : b.touch1 && b.touch1[2] === Y.identifier && delete b.touch1;
      if (b.touch1 && !b.touch0 && (b.touch0 = b.touch1, delete b.touch1), b.touch0) b.touch0[1] = this.__zoom.invert(b.touch0[0]);
      else if (b.end(), b.taps === 2 && (Y = Rt(Y, this), Math.hypot(g[0] - Y[0], g[1] - Y[1]) < G)) {
        var R = ct(this).on("dblclick.zoom");
        R && R.apply(this, arguments);
      }
    }
  }
  return S.wheelDelta = function(p) {
    return arguments.length ? (r = typeof p == "function" ? p : ye(+p), S) : r;
  }, S.filter = function(p) {
    return arguments.length ? (t = typeof p == "function" ? p : ye(!!p), S) : t;
  }, S.touchable = function(p) {
    return arguments.length ? (i = typeof p == "function" ? p : ye(!!p), S) : i;
  }, S.extent = function(p) {
    return arguments.length ? (e = typeof p == "function" ? p : ye([[+p[0][0], +p[0][1]], [+p[1][0], +p[1][1]]]), S) : e;
  }, S.scaleExtent = function(p) {
    return arguments.length ? (o[0] = +p[0], o[1] = +p[1], S) : [o[0], o[1]];
  }, S.translateExtent = function(p) {
    return arguments.length ? (a[0][0] = +p[0][0], a[1][0] = +p[1][0], a[0][1] = +p[0][1], a[1][1] = +p[1][1], S) : [[a[0][0], a[0][1]], [a[1][0], a[1][1]]];
  }, S.constrain = function(p) {
    return arguments.length ? (n = p, S) : n;
  }, S.duration = function(p) {
    return arguments.length ? (s = +p, S) : s;
  }, S.interpolate = function(p) {
    return arguments.length ? (l = p, S) : l;
  }, S.on = function() {
    var p = u.on.apply(u, arguments);
    return p === u ? S : p;
  }, S.clickDistance = function(p) {
    return arguments.length ? ($ = (p = +p) * p, S) : Math.sqrt($);
  }, S.tapDistance = function(p) {
    return arguments.length ? (G = +p, S) : G;
  }, S;
}
class Dl {
  static render(e, n, r) {
    const i = {
      axisStrategy: r.axisStrategy ?? "time",
      minLabelGap: r.minLabelGap ?? 40,
      labelYOffset: r.labelYOffset ?? -16,
      cardWidth: r.cardWidth ?? 140,
      cardHeight: r.cardHeight ?? 200,
      // portrait (taller)
      enforceUniformCardSize: r.enforceUniformCardSize ?? !0,
      hideOverlappingLabels: r.hideOverlappingLabels ?? !0,
      labelCardGap: r.labelCardGap ?? 8,
      mediaObjectFit: r.mediaObjectFit ?? "cover",
      ...r
    };
    n.innerHTML = "";
    const o = { top: 10, right: 80, bottom: 50, left: 80 }, a = n.clientWidth - o.left - o.right, s = n.clientHeight - o.top - o.bottom, l = r.zoom?.minScale ?? 1, u = r.zoom?.maxScale ?? 80, c = ct(n), g = c.append("svg").attr("width", a + o.left + o.right).attr("height", s + o.top + o.bottom).style("background", "var(--tl-background-color, #fff)"), d = a + o.left + o.right, v = s + o.top + o.bottom, L = g.append("g").attr("class", "tl-canvas-bg"), $ = r.canvasBackground;
    if (!$)
      g.style("background", "var(--tl-background-color, #fff)");
    else if ($.kind === "color")
      g.style(
        "background",
        $.value ?? "var(--tl-background-color, #fff)"
      );
    else if ($.kind === "image") {
      const T = $.fit ?? "cover";
      L.append("foreignObject").attr("x", 0).attr("y", 0).attr("width", d).attr("height", v).append("xhtml:div").style("width", `${d}px`).style("height", `${v}px`).style("opacity", String($.opacity ?? 1)).style("backgroundImage", `url("${$.src}")`).style("backgroundRepeat", "no-repeat").style("backgroundPosition", "center").style("backgroundSize", T === "contain" ? "contain" : "cover");
    } else if ($.kind === "video") {
      const T = $.fit ?? "cover", y = L.append("foreignObject").attr("x", 0).attr("y", 0).attr("width", d).attr("height", v).append("xhtml:div").style("width", `${d}px`).style("height", `${v}px`).style("overflow", "hidden").style("opacity", String($.opacity ?? 1)).append("xhtml:video");
      y.style("width", "100%").style("height", "100%").style("objectFit", T === "contain" ? "contain" : "cover").style("objectPosition", "center").attr("src", $.src).attr("playsinline", "true").attr("muted", $.muted ?? !0 ? "" : null).attr("loop", $.loop ?? !0 ? "" : null).attr("autoplay", $.autoplay ?? !0 ? "" : null).attr("controls", $.controls ?? !1 ? "" : null), $.poster && y.attr("poster", $.poster);
      try {
        y.node()?.play?.().catch(() => {
        });
      } catch {
      }
    }
    const G = g.append("g").attr("transform", `translate(${o.left},${o.top})`), S = [...e.items].sort((T, _) => +T.start - +_.start), tt = S.map((T) => T.start), Z = r.baselineY ?? s / 2, [H, K] = hr(tt), A = Zr().domain([H, K]).range([0, a]), z = S.map((T, _) => _.toString()), f = Qn().domain(z).range([0, a]).padding(0.5), h = (T) => T.rescaleX(A), x = (T, _, y) => {
      if (i.axisStrategy === "point") {
        const M = f(_.toString()) ?? 0;
        return y.applyX(M);
      } else
        return h(y)(T.start);
    };
    G.append("line").attr("x1", 0).attr("x2", a).attr("y1", Z).attr("y2", Z).attr("stroke", "var(--tl-axis-color, var(--tl-primary-color, #4285f4))").attr("stroke-width", 2);
    const E = G.append("g").attr("transform", `translate(0,${s + 5})`), D = () => {
      E.attr("fill", null), E.select(".domain").attr(
        "stroke",
        "var(--tl-axis-color, var(--tl-primary-color, #4285f4))"
      ).attr("fill", "none"), E.selectAll(".tick line").attr(
        "stroke",
        "var(--tl-axis-color, var(--tl-primary-color, #4285f4))"
      ), E.selectAll(".tick text").attr("fill", "var(--tl-tick-color, var(--tl-primary-color, #4285f4))").attr("font-family", "var(--tl-font, system-ui)").attr("font-size", "10px");
    }, W = G.append("g"), p = W.append("g"), N = W.append("g"), b = p.selectAll("circle").data(S).enter().append("circle").attr("cy", Z).attr("r", 6).attr("fill", "var(--tl-accent-color, var(--tl-primary-color, #4285f4))").style("cursor", (T) => i.onItemClick ? "pointer" : "default").on("click", (T, _) => i.onItemClick?.(_, T)).on(
      "mouseover",
      (T, _) => i.onItemHover?.(_, T)
    ), k = N.selectAll("g.tl-label").data(S).enter().append("g").attr("class", "tl-label").style("cursor", (T) => i.onItemClick ? "pointer" : "default").on("click", (T, _) => i.onItemClick?.(_, T)).on(
      "mouseover",
      (T, _) => i.onItemHover?.(_, T)
    );
    k.each(function(T) {
      const _ = T.label, y = ct(this);
      y.selectAll("*").remove();
      const M = i.enforceUniformCardSize ? i.cardWidth : _?.width ?? i.cardWidth, w = i.enforceUniformCardSize ? i.cardHeight : _?.height ?? i.cardHeight, m = Z + i.labelYOffset, P = y.append("g").attr("class", "tl-card").attr("transform", `translate(${-M / 2}, ${m - w})`).attr("data-card-width", String(M));
      if (P.append("rect").attr("class", "tl-card-bg").attr("x", 0).attr("y", 0).attr("width", M).attr("height", w).attr("rx", 10).attr("ry", 10).attr("fill", "var(--tl-card-bg, transparent)").attr("stroke", "var(--tl-card-border, transparent)"), !_ || _.kind === "text")
        P.append("foreignObject").attr("class", "tl-label-text-card").attr("x", 0).attr("y", 0).attr("width", M).attr("height", w).append("xhtml:div").style("width", `${M}px`).style("height", `${w}px`).style("display", "flex").style("align-items", "center").style("justify-content", "center").style("padding", "8px 12px 8px 10px").style("text-align", "center").style("font-family", "var(--tl-font, system-ui)").style("color", "var(--tl-text-color, #e6eefc)").style("line-height", "1.25").style("overflow", "hidden").text(_ && _.text || T.title);
      else if (_.kind === "image") {
        const X = (_.fit ?? i.mediaObjectFit ?? "cover") === "contain" ? "xMidYMid meet" : "xMidYMid slice", et = _.zoom ?? 1;
        P.append("g").attr("class", "tl-media").attr(
          "transform",
          et !== 1 ? `translate(${M / 2}, ${w / 2}) scale(${et}) translate(${-M / 2}, ${-w / 2})` : null
        ).append("image").attr("class", "tl-label-image").attr("href", _.src).attr("x", 0).attr("y", 0).attr("width", M).attr("height", w).attr("preserveAspectRatio", X), _.alt && P.append("title").text(_.alt);
      } else if (_.kind === "video") {
        const nt = _.fit ?? i.mediaObjectFit ?? "cover", X = _.zoom ?? 1, mt = P.append("foreignObject").attr("class", "tl-label-video").attr("x", 0).attr("y", 0).attr("width", M).attr("height", w).append("xhtml:div").style("width", `${M}px`).style("height", `${w}px`).style("overflow", "hidden").style("borderRadius", "var(--tl-card-radius, 10px)").style("boxShadow", "var(--tl-card-shadow, none)").style("pointerEvents", "auto").style("transformOrigin", "center").style("transform", X !== 1 ? `scale(${X})` : "none").append("xhtml:video");
        mt.style("width", "100%").style("height", "100%").style("objectFit", nt === "contain" ? "contain" : "cover").style("objectPosition", "center").attr("src", _.src).attr("playsinline", "true").attr("muted", "").attr("loop", "").attr("autoplay", "").attr("controls", null), _.poster && mt.attr("poster", _.poster);
        try {
          mt.node()?.play?.().catch(() => {
          });
        } catch {
        }
      }
      T.overlayColor && P.append("rect").attr("class", "tl-card-overlay").attr("x", 0).attr("y", 0).attr("width", M).attr("height", w).attr("rx", 10).attr("ry", 10).attr("fill", T.overlayColor).style("opacity", "0.4").style("pointer-events", "none");
      const O = `translate(${-M / 2}, ${m - w})`;
      P.attr("transform", O);
      const V = () => P.transition().duration(120).attr(
        "transform",
        `${O} translate(${M / 2},${w / 2}) scale(1.07) translate(${-M / 2},${-w / 2})`
      ), q = () => P.transition().duration(120).attr("transform", O);
      y.on("mouseenter", V).on("mouseleave", q);
    });
    const U = c.append("div").attr("class", "tl-tooltip").style("position", "absolute").style("pointer-events", "none").style("padding", "6px 10px").style("border-radius", "4px").style("background", "var(--tl-tooltip-bg, rgba(0,0,0,0.7))").style("color", "var(--tl-tooltip-color, #fff)").style("font-family", "var(--tl-font, system-ui)").style("font-size", "12px").style("opacity", "0");
    function C(T) {
      const _ = T.start.toLocaleDateString(), y = T.end ? ` – ${T.end.toLocaleDateString()}` : "", M = T.description ? `<div>${T.description}</div>` : "";
      return `<strong>${T.title}</strong><div>${_}${y}</div>${M}`;
    }
    const Y = (T) => {
      T.on(
        "mouseover",
        (_, y) => U.html(C(y)).style("opacity", "1")
      ).on(
        "mousemove",
        (_) => U.style("left", `${_.pageX + 10}px`).style("top", `${_.pageY + 10}px`)
      ).on("mouseout", () => U.style("opacity", "0"));
    };
    Y(b), Y(k);
    function R(T) {
      const _ = E.selectAll(".tick").nodes();
      let y = -1 / 0;
      _.forEach((M) => {
        const w = M.transform?.baseVal?.[0]?.matrix?.e ?? M.getCTM()?.e ?? 0;
        w - y < T ? M.style.display = "none" : (M.style.display = "", y = w);
      });
    }
    const I = (T) => {
      if (b.attr("cx", (_, y) => x(_, y, T)), k.each(function(_, y) {
        const M = x(_, y, T);
        ct(this).attr("transform", `translate(${M},0)`).style("display", "");
      }), i.axisStrategy === "point") {
        const _ = (f.step?.() ?? a / Math.max(1, S.length - 1)) * T.k, y = Math.max(
          1,
          Math.ceil(i.minLabelGap / Math.max(1, _))
        ), M = S.map((w, m) => m).filter((w) => w % y === 0).map((w) => w.toString());
        E.call(
          Rn(
            Qn().domain(M).range([T.applyX(0), T.applyX(a)])
          ).tickFormat((w) => {
            const m = Number(w), P = S[m]?.start;
            return P ? Qt("%Y-%m-%d")(P) : "";
          })
        );
      } else {
        const _ = h(T);
        E.call(
          Rn(_).ticks(10).tickFormat(Qt("%Y-%m-%d"))
        );
      }
      if (D(), R(i.minLabelGap), i.hideOverlappingLabels && Q(T), i.onRangeChange)
        if (i.axisStrategy === "time") {
          const _ = T.rescaleX(A);
          i.onRangeChange(_.domain());
        } else {
          const _ = (f.step?.() ?? 1) * T.k, y = Math.max(
            0,
            Math.floor((0 - T.x) / Math.max(1, _))
          ), M = Math.min(
            S.length - 1,
            Math.ceil((a - T.x) / Math.max(1, _))
          ), w = S[y]?.start ?? S[0].start, m = S[M]?.start ?? S[S.length - 1].start;
          i.onRangeChange([w, m]);
        }
    }, F = Kr().scaleExtent([l, u]).translateExtent([
      [0, 0],
      [a, s]
    ]).extent([
      [0, 0],
      [a, s]
    ]).on("zoom", (T) => {
      const _ = T.transform;
      i.axisStrategy === "point" ? (W.attr("transform", `translate(${_.x},0)`), I(_)) : (W.attr("transform", null), I(_));
    });
    g.call(F);
    function B() {
      if (S.length <= 1) return Mt;
      const T = r.zoom?.initialScale;
      if (T && isFinite(T)) return Mt.scale(T);
      if (i.axisStrategy === "point") {
        const _ = f.step?.() ?? a / Math.max(1, S.length - 1), y = Math.max(
          1,
          (i.minLabelGap ?? 40) / Math.max(1, _)
        );
        return Mt.scale(
          Math.min(u, Math.max(l, y))
        );
      } else {
        let _ = 1 / 0;
        for (let w = 1; w < S.length; w++) {
          const m = Math.abs(
            A(S[w].start) - A(S[w - 1].start)
          );
          m > 0 && m < _ && (_ = m);
        }
        if (!isFinite(_) || _ === 0) return Mt;
        const M = Math.max(
          i.cardWidth + (i.labelCardGap ?? 8),
          i.minLabelGap ?? 40
        ) / _;
        return Mt.scale(
          Math.min(u, Math.max(l, M))
        );
      }
    }
    function Q(T) {
      const _ = k.nodes().map((w, m) => {
        const P = ct(w), O = P.datum(), V = x(O, m, T), nt = P.select("g.tl-card").attr("data-card-width"), X = Number(nt) || i.cardWidth;
        return { node: w, x: V, w: X };
      });
      _.sort((w, m) => w.x - m.x);
      let y = -1 / 0;
      const M = i.labelCardGap;
      for (const { node: w, x: m, w: P } of _) {
        const O = m - P / 2, V = m + P / 2;
        O < y + M ? w.style.display = "none" : (w.style.display = "", y = V);
      }
    }
    const J = B();
    i.axisStrategy === "point" ? (W.attr("transform", `scale(${J.k},1)`), F.transform(g, J), I(J)) : (F.transform(g, J), I(J));
  }
}
class Nl {
  /**
   * Render a zoomable vertical timeline: axis + baseline + dots + labels.
   */
  static render(e, n, r) {
    n.innerHTML = "";
    const i = { top: 20, right: 10, bottom: 20, left: 60 }, o = n.clientWidth - i.left - i.right, a = n.clientHeight - i.top - i.bottom, s = ct(n), l = s.append("svg").attr("width", i.left + o + i.right).attr("height", i.top + a + i.bottom);
    l.append("rect").attr("width", i.left + o + i.right).attr("height", i.top + a + i.bottom).style("fill", "none").style("pointer-events", "all");
    const u = l.append("g").attr("transform", `translate(${i.left},${i.top})`), c = e.items.map((H) => H.start), [g, d] = hr(c), v = Zr().domain([g, d]).range([0, a]);
    if (r.showTodayLine) {
      const H = v(/* @__PURE__ */ new Date());
      u.append("line").attr("x1", 0).attr("x2", o).attr("y1", H).attr("y2", H).attr("stroke", "var(--tl-primary-color, steelblue)").attr("stroke-dasharray", "4 2");
    }
    u.append("line").attr("x1", o / 2).attr("x2", o / 2).attr("y1", 0).attr("y2", a).attr("stroke", "var(--tl-primary-color, steelblue)").attr("stroke-width", 2);
    const L = u.append("g").call(
      Fn(v).tickValues(c).tickFormat(Qt("%Y-%m-%d"))
    );
    L.attr("fill", null), L.select(".domain").attr("stroke", "var(--tl-primary-color, steelblue)").attr("fill", "none"), L.selectAll(".tick line").attr("stroke", "var(--tl-primary-color, steelblue)"), L.selectAll(".tick text").attr("fill", "var(--tl-primary-color, steelblue)").attr("font-family", "var(--tl-font, sans-serif)").attr("font-size", "10px").attr("dx", "-8");
    const $ = s.append("div").attr("class", "tl-tooltip").style("position", "absolute").style("pointer-events", "none").style("padding", "6px 10px").style("border-radius", "4px").style("background", "var(--tl-tooltip-bg, rgba(0,0,0,0.7))").style("color", "var(--tl-tooltip-color, #fff)").style("font-family", "var(--tl-font, sans-serif)").style("font-size", "12px").style("opacity", "0");
    function G(H) {
      const K = H.start.toLocaleDateString(), A = H.end ? ` – ${H.end.toLocaleDateString()}` : "", z = H.description ? `<div>${H.description}</div>` : "";
      return `<strong>${H.title}</strong><div>${K}${A}</div>${z}`;
    }
    const S = u.append("g").selectAll("g.event").data(e.items).enter().append("g").attr("class", "event");
    S.append("circle").attr("cx", o / 2).attr("cy", (H) => v(H.start)).attr("r", 6).attr("fill", "var(--tl-primary-color, steelblue)").on("click", (H, K) => r.onItemClick?.(K, H)).on("mouseover", (H, K) => {
      r.onItemHover?.(K, H), $.html(G(K)).style("opacity", "1");
    }).on("mousemove", (H) => $.style("left", `${H.pageX + 10}px`).style("top", `${H.pageY + 10}px`)).on("mouseout", () => $.style("opacity", "0")), S.append("text").attr("x", o / 2 + 12).attr("y", (H) => v(H.start) + 4).text((H) => H.title).attr("fill", "var(--tl-primary-color, steelblue)").attr("font-family", "var(--tl-font, sans-serif)").attr("font-size", "12px");
    const tt = (H) => {
      const K = H.rescaleY(v);
      L.call(
        Fn(K).tickValues(c).tickFormat(Qt("%Y-%m-%d"))
      ), L.selectAll(".tick text").attr("fill", "var(--tl-primary-color, steelblue)"), S.selectAll("circle").attr("cy", (A) => K(A.start)), S.selectAll("text").attr("y", (A) => K(A.start) + 4), r.onRangeChange?.(K.domain());
    }, Z = Kr().scaleExtent([1, 10]).translateExtent([[0, 0], [o, a]]).extent([[0, 0], [o, a]]).on("zoom", (H) => tt(H.transform));
    l.call(Z), Z.transform(l, Mt), tt(Mt);
  }
}
class Rl {
  /** Render events as a responsive, themeable CSS grid of cards. */
  static render(e, n, r) {
    n.innerHTML = "";
    const i = "chrono-leaf-grid-styles";
    if (!document.getElementById(i)) {
      const a = document.createElement("style");
      a.id = i, a.textContent = `
        .tl-grid {
          display: grid;
          gap: var(--grid-gap, 16px);
          grid-template-columns: repeat(auto-fit, minmax(var(--grid-item-min, 150px), 1fr));
          padding: var(--grid-padding, 16px);
          background: var(--tl-background-color);
          font-family: var(--tl-font);
          border-radius: var(--tl-border-radius);
        }
        .tl-grid-item {
          position: relative;
          background: var(--card-bg, #fff);
          color: var(--card-color, inherit);
          border-radius: var(--tl-border-radius);
          box-shadow: var(--card-shadow, 0 1px 4px rgba(0,0,0,0.1));
          padding: var(--card-padding, 12px);
          overflow: hidden;
          cursor: pointer;
        }
        .tl-grid-item h4 {
          margin: 0 0 var(--card-title-gap, 4px) 0;
          font-size: var(--card-title-size, 1em);
        }
        .tl-grid-item time {
          display: block;
          font-size: var(--card-date-size, 0.85em);
          color: var(--card-date-color, #555);
        }
        .tl-grid-item p {
          margin-top: var(--card-desc-gap, 8px);
          font-size: var(--card-desc-size, 0.9em);
          color: var(--card-desc-color, #333);
        }
      `, document.head.appendChild(a);
    }
    const o = document.createElement("div");
    o.className = "tl-grid", e.items.forEach((a) => {
      const s = document.createElement("div");
      s.className = "tl-grid-item", a.background?.type === "color" && (s.style.backgroundColor = a.background.source), r.onItemClick && s.addEventListener("click", (c) => r.onItemClick(a, c)), r.onItemHover && s.addEventListener("mouseenter", (c) => r.onItemHover(a, c));
      const l = document.createElement("h4");
      l.textContent = a.title, s.appendChild(l);
      const u = document.createElement("time");
      if (u.textContent = a.start.toLocaleDateString() + (a.end ? ` – ${a.end.toLocaleDateString()}` : ""), s.appendChild(u), a.description) {
        const c = document.createElement("p");
        c.textContent = a.description, s.appendChild(c);
      }
      o.appendChild(s);
    }), n.appendChild(o);
  }
}
function Fl(t) {
  return t.replace(/[A-Z]/g, (e) => "-" + e.toLowerCase());
}
function Ul(t, e) {
  if (t.classList.remove("tl-theme-light", "tl-theme-dark"), Array.from(t.style).forEach((n) => {
    n.startsWith("--tl-") && t.style.removeProperty(n);
  }), !!e)
    if (e === "light" || e === "dark")
      t.classList.add(`tl-theme-${e}`);
    else
      for (const [n, r] of Object.entries(e)) {
        if (r == null) continue;
        const i = `--tl-${Fl(n)}`;
        t.style.setProperty(i, r);
      }
}
class Wt {
  constructor(e, n) {
    this.items = e, this.config = {
      theme: "light",
      // ← default!
      mode: "slider",
      showTodayLine: !0,
      interactive: !0,
      language: "en",
      ...n
    };
  }
  render(e) {
    switch (e.innerHTML = "", Ul(e, this.config.theme), this.config.mode) {
      case "slider":
        Dl.render(this, e, this.config);
        break;
      case "vertical":
        Nl.render(this, e, this.config);
        break;
      case "grid":
        Rl.render(this, e, this.config);
        break;
      default:
        e.innerHTML = this.toHTML();
    }
  }
  toHTML() {
    return `<div class="tl-container">${this.items.map(
      (n) => `<div class="tl-item">
         <strong>${n.title}</strong>
         <time>${n.start.toLocaleDateString()}</time>
       </div>`
    ).join("")}</div>`;
  }
  /*____________________________
    ----------Parsers-----------
    ____________________________
  */
  static fromCSV(e) {
    const n = Nt.parse(e, "csv");
    return new Wt(n);
  }
  static fromJSON(e) {
    const n = Nt.parse(e, "json");
    return new Wt(n);
  }
  static fromXML(e) {
    const n = Nt.parse(e, "xml");
    return new Wt(n);
  }
  static fromTEI(e) {
    const n = Nt.parse(e, "tei");
    return new Wt(n);
  }
  //generic import
  static from(e, n) {
    const r = Nt.parse(e, n);
    return new Wt(r);
  }
  //registration sugar
  static registerParser(e) {
    Nt.register(e);
  }
  // introspection
  static supportedFormats() {
    return Nt.supportedFormats();
  }
}
const fr = "chrono-leaf-default-themes";
if (!document.getElementById(fr)) {
  const t = document.createElement("style");
  t.id = fr, t.textContent = `
     /* Theme classes just set variables */
      .tl-theme-light {
       --tl-primary-color: #4285f4;
       --tl-background-color: #fff;
       --tl-font: system-ui, sans-serif;
       --tl-border-radius: 4px;
       --tl-tooltip-bg: rgba(0,0,0,0.7);
       --tl-tooltip-color: #fff;
       --tl-card-bg: rgba(0,0,0,0.04);
       --tl-card-border: rgba(0,0,0,0.15);
       --tl-card-radius: 10px;
       --tl-card-shadow: 0 2px 8px rgba(0,0,0,0.12);
       }
       .tl-theme-dark {
        --tl-primary-color: #8ab4f8;
        --tl-background-color: #222;
        --tl-font: system-ui, sans-serif;
        --tl-border-radius: 4px;
        --tl-tooltip-bg: rgba(255,255,255,0.85);
        --tl-tooltip-color: #000;
        --tl-card-bg: rgba(255,255,255,0.06);
        --tl-card-border: rgba(255,255,255,0.18);
        --tl-card-radius: 10px;
        --tl-card-shadow: 0 2px 10px rgba(0,0,0,0.35);
      }

     /* Base container styles */
     .tl-container, .tl-grid {
       background: var(--tl-background-color);
       font-family: var(--tl-font);
       border-radius: var(--tl-border-radius);
      color: inherit;
       color: var(--tl-text-color, inherit);
     }
  .tl-container svg foreignObject.tl-label-video {
    overflow: visible;
  }
  .tl-container svg .tl-label-text {
    user-select: none;
  }

     /* Axis & SVG text defaults (renderer reads these vars) */
     .tl-container svg .domain,
     .tl-container svg .tick line {
       stroke: var(--tl-axis-color, var(--tl-primary-color, #4285f4));
     }
     .tl-container svg .tick text {
       fill: var(--tl-tick-color, var(--tl-primary-color, #4285f4));
       font-family: var(--tl-font);
     }
 
     /* Tooltip */
     .tl-tooltip {
       background: var(--tl-tooltip-bg);
       color: var(--tl-tooltip-color);
       font-family: var(--tl-font);
     }
   `, document.head.appendChild(t);
}
export {
  Wt as Timeline
};
//# sourceMappingURL=chrono-leaf.es.js.map
