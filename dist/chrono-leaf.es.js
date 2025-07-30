function Yr(t) {
  return t && t.__esModule && Object.prototype.hasOwnProperty.call(t, "default") ? t.default : t;
}
var ye = { exports: {} };
/* @license
Papa Parse
v5.5.3
https://github.com/mholt/PapaParse
License: MIT
*/
var Pr = ye.exports, kn;
function qr() {
  return kn || (kn = 1, function(t, e) {
    ((n, r) => {
      t.exports = r();
    })(Pr, function n() {
      var r = typeof self < "u" ? self : typeof window < "u" ? window : r !== void 0 ? r : {}, i, a = !r.document && !!r.postMessage, o = r.IS_PAPA_WORKER || !1, u = {}, l = 0, s = {};
      function c(f) {
        this._handle = null, this._finished = !1, this._completed = !1, this._halted = !1, this._input = null, this._baseIndex = 0, this._partialLine = "", this._rowCount = 0, this._start = 0, this._nextChunk = null, this.isFirstChunk = !0, this._completeResults = { data: [], errors: [], meta: {} }, (function(h) {
          var v = U(h);
          v.chunkSize = parseInt(v.chunkSize), h.step || h.chunk || (v.chunkSize = null), this._handle = new q(v), (this._handle.streamer = this)._config = v;
        }).call(this, f), this.parseChunk = function(h, v) {
          var S = parseInt(this._config.skipFirstNLines) || 0;
          if (this.isFirstChunk && 0 < S) {
            let P = this._config.newline;
            P || (C = this._config.quoteChar || '"', P = this._handle.guessLineEndings(h, C)), h = [...h.split(P).slice(S)].join(P);
          }
          this.isFirstChunk && D(this._config.beforeFirstChunk) && (C = this._config.beforeFirstChunk(h)) !== void 0 && (h = C), this.isFirstChunk = !1, this._halted = !1;
          var S = this._partialLine + h, C = (this._partialLine = "", this._handle.parse(S, this._baseIndex, !this._finished));
          if (!this._handle.paused() && !this._handle.aborted()) {
            if (h = C.meta.cursor, S = (this._finished || (this._partialLine = S.substring(h - this._baseIndex), this._baseIndex = h), C && C.data && (this._rowCount += C.data.length), this._finished || this._config.preview && this._rowCount >= this._config.preview), o) r.postMessage({ results: C, workerId: s.WORKER_ID, finished: S });
            else if (D(this._config.chunk) && !v) {
              if (this._config.chunk(C, this._handle), this._handle.paused() || this._handle.aborted()) return void (this._halted = !0);
              this._completeResults = C = void 0;
            }
            return this._config.step || this._config.chunk || (this._completeResults.data = this._completeResults.data.concat(C.data), this._completeResults.errors = this._completeResults.errors.concat(C.errors), this._completeResults.meta = C.meta), this._completed || !S || !D(this._config.complete) || C && C.meta.aborted || (this._config.complete(this._completeResults, this._input), this._completed = !0), S || C && C.meta.paused || this._nextChunk(), C;
          }
          this._halted = !0;
        }, this._sendError = function(h) {
          D(this._config.error) ? this._config.error(h) : o && this._config.error && r.postMessage({ workerId: s.WORKER_ID, error: h, finished: !1 });
        };
      }
      function m(f) {
        var h;
        (f = f || {}).chunkSize || (f.chunkSize = s.RemoteChunkSize), c.call(this, f), this._nextChunk = a ? function() {
          this._readChunk(), this._chunkLoaded();
        } : function() {
          this._readChunk();
        }, this.stream = function(v) {
          this._input = v, this._nextChunk();
        }, this._readChunk = function() {
          if (this._finished) this._chunkLoaded();
          else {
            if (h = new XMLHttpRequest(), this._config.withCredentials && (h.withCredentials = this._config.withCredentials), a || (h.onload = b(this._chunkLoaded, this), h.onerror = b(this._chunkError, this)), h.open(this._config.downloadRequestBody ? "POST" : "GET", this._input, !a), this._config.downloadRequestHeaders) {
              var v, S = this._config.downloadRequestHeaders;
              for (v in S) h.setRequestHeader(v, S[v]);
            }
            var C;
            this._config.chunkSize && (C = this._start + this._config.chunkSize - 1, h.setRequestHeader("Range", "bytes=" + this._start + "-" + C));
            try {
              h.send(this._config.downloadRequestBody);
            } catch (P) {
              this._chunkError(P.message);
            }
            a && h.status === 0 && this._chunkError();
          }
        }, this._chunkLoaded = function() {
          h.readyState === 4 && (h.status < 200 || 400 <= h.status ? this._chunkError() : (this._start += this._config.chunkSize || h.responseText.length, this._finished = !this._config.chunkSize || this._start >= ((v) => (v = v.getResponseHeader("Content-Range")) !== null ? parseInt(v.substring(v.lastIndexOf("/") + 1)) : -1)(h), this.parseChunk(h.responseText)));
        }, this._chunkError = function(v) {
          v = h.statusText || v, this._sendError(new Error(v));
        };
      }
      function p(f) {
        (f = f || {}).chunkSize || (f.chunkSize = s.LocalChunkSize), c.call(this, f);
        var h, v, S = typeof FileReader < "u";
        this.stream = function(C) {
          this._input = C, v = C.slice || C.webkitSlice || C.mozSlice, S ? ((h = new FileReader()).onload = b(this._chunkLoaded, this), h.onerror = b(this._chunkError, this)) : h = new FileReaderSync(), this._nextChunk();
        }, this._nextChunk = function() {
          this._finished || this._config.preview && !(this._rowCount < this._config.preview) || this._readChunk();
        }, this._readChunk = function() {
          var C = this._input, P = (this._config.chunkSize && (P = Math.min(this._start + this._config.chunkSize, this._input.size), C = v.call(C, this._start, P)), h.readAsText(C, this._config.encoding));
          S || this._chunkLoaded({ target: { result: P } });
        }, this._chunkLoaded = function(C) {
          this._start += this._config.chunkSize, this._finished = !this._config.chunkSize || this._start >= this._input.size, this.parseChunk(C.target.result);
        }, this._chunkError = function() {
          this._sendError(h.error);
        };
      }
      function g(f) {
        var h;
        c.call(this, f = f || {}), this.stream = function(v) {
          return h = v, this._nextChunk();
        }, this._nextChunk = function() {
          var v, S;
          if (!this._finished) return v = this._config.chunkSize, h = v ? (S = h.substring(0, v), h.substring(v)) : (S = h, ""), this._finished = !h, this.parseChunk(S);
        };
      }
      function z(f) {
        c.call(this, f = f || {});
        var h = [], v = !0, S = !1;
        this.pause = function() {
          c.prototype.pause.apply(this, arguments), this._input.pause();
        }, this.resume = function() {
          c.prototype.resume.apply(this, arguments), this._input.resume();
        }, this.stream = function(C) {
          this._input = C, this._input.on("data", this._streamData), this._input.on("end", this._streamEnd), this._input.on("error", this._streamError);
        }, this._checkIsFinished = function() {
          S && h.length === 1 && (this._finished = !0);
        }, this._nextChunk = function() {
          this._checkIsFinished(), h.length ? this.parseChunk(h.shift()) : v = !0;
        }, this._streamData = b(function(C) {
          try {
            h.push(typeof C == "string" ? C : C.toString(this._config.encoding)), v && (v = !1, this._checkIsFinished(), this.parseChunk(h.shift()));
          } catch (P) {
            this._streamError(P);
          }
        }, this), this._streamError = b(function(C) {
          this._streamCleanUp(), this._sendError(C);
        }, this), this._streamEnd = b(function() {
          this._streamCleanUp(), S = !0, this._streamData("");
        }, this), this._streamCleanUp = b(function() {
          this._input.removeListener("data", this._streamData), this._input.removeListener("end", this._streamEnd), this._input.removeListener("error", this._streamError);
        }, this);
      }
      function q(f) {
        var h, v, S, C, P = Math.pow(2, 53), d = -P, M = /^\s*-?(\d+\.?|\.\d+|\d+\.\d+)([eE][-+]?\d+)?\s*$/, _ = /^((\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z)))$/, x = this, R = 0, k = 0, O = !1, E = !1, L = [], A = { data: [], errors: [], meta: {} };
        function B(Y) {
          return f.skipEmptyLines === "greedy" ? Y.join("").trim() === "" : Y.length === 1 && Y[0].length === 0;
        }
        function G() {
          if (A && S && (tt("Delimiter", "UndetectableDelimiter", "Unable to auto-detect delimiting character; defaulted to '" + s.DefaultDelimiter + "'"), S = !1), f.skipEmptyLines && (A.data = A.data.filter(function(T) {
            return !B(T);
          })), j()) {
            let T = function(y, K) {
              D(f.transformHeader) && (y = f.transformHeader(y, K)), L.push(y);
            };
            if (A) if (Array.isArray(A.data[0])) {
              for (var Y = 0; j() && Y < A.data.length; Y++) A.data[Y].forEach(T);
              A.data.splice(0, 1);
            } else A.data.forEach(T);
          }
          function w(T, y) {
            for (var K = f.header ? {} : [], $ = 0; $ < T.length; $++) {
              var V = $, H = T[$], H = ((nt, W) => ((et) => (f.dynamicTypingFunction && f.dynamicTyping[et] === void 0 && (f.dynamicTyping[et] = f.dynamicTypingFunction(et)), (f.dynamicTyping[et] || f.dynamicTyping) === !0))(nt) ? W === "true" || W === "TRUE" || W !== "false" && W !== "FALSE" && (((et) => {
                if (M.test(et) && (et = parseFloat(et), d < et && et < P))
                  return 1;
              })(W) ? parseFloat(W) : _.test(W) ? new Date(W) : W === "" ? null : W) : W)(V = f.header ? $ >= L.length ? "__parsed_extra" : L[$] : V, H = f.transform ? f.transform(H, V) : H);
              V === "__parsed_extra" ? (K[V] = K[V] || [], K[V].push(H)) : K[V] = H;
            }
            return f.header && ($ > L.length ? tt("FieldMismatch", "TooManyFields", "Too many fields: expected " + L.length + " fields but parsed " + $, k + y) : $ < L.length && tt("FieldMismatch", "TooFewFields", "Too few fields: expected " + L.length + " fields but parsed " + $, k + y)), K;
          }
          var I;
          A && (f.header || f.dynamicTyping || f.transform) && (I = 1, !A.data.length || Array.isArray(A.data[0]) ? (A.data = A.data.map(w), I = A.data.length) : A.data = w(A.data, 0), f.header && A.meta && (A.meta.fields = L), k += I);
        }
        function j() {
          return f.header && L.length === 0;
        }
        function tt(Y, w, I, T) {
          Y = { type: Y, code: w, message: I }, T !== void 0 && (Y.row = T), A.errors.push(Y);
        }
        D(f.step) && (C = f.step, f.step = function(Y) {
          A = Y, j() ? G() : (G(), A.data.length !== 0 && (R += Y.data.length, f.preview && R > f.preview ? v.abort() : (A.data = A.data[0], C(A, x))));
        }), this.parse = function(Y, w, I) {
          var T = f.quoteChar || '"', T = (f.newline || (f.newline = this.guessLineEndings(Y, T)), S = !1, f.delimiter ? D(f.delimiter) && (f.delimiter = f.delimiter(Y), A.meta.delimiter = f.delimiter) : ((T = ((y, K, $, V, H) => {
            var nt, W, et, Et;
            H = H || [",", "	", "|", ";", s.RECORD_SEP, s.UNIT_SEP];
            for (var zt = 0; zt < H.length; zt++) {
              for (var pt, Gt = H[zt], at = 0, gt = 0, it = 0, st = (et = void 0, new N({ comments: V, delimiter: Gt, newline: K, preview: 10 }).parse(y)), _t = 0; _t < st.data.length; _t++) $ && B(st.data[_t]) ? it++ : (pt = st.data[_t].length, gt += pt, et === void 0 ? et = pt : 0 < pt && (at += Math.abs(pt - et), et = pt));
              0 < st.data.length && (gt /= st.data.length - it), (W === void 0 || at <= W) && (Et === void 0 || Et < gt) && 1.99 < gt && (W = at, nt = Gt, Et = gt);
            }
            return { successful: !!(f.delimiter = nt), bestDelimiter: nt };
          })(Y, f.newline, f.skipEmptyLines, f.comments, f.delimitersToGuess)).successful ? f.delimiter = T.bestDelimiter : (S = !0, f.delimiter = s.DefaultDelimiter), A.meta.delimiter = f.delimiter), U(f));
          return f.preview && f.header && T.preview++, h = Y, v = new N(T), A = v.parse(h, w, I), G(), O ? { meta: { paused: !0 } } : A || { meta: { paused: !1 } };
        }, this.paused = function() {
          return O;
        }, this.pause = function() {
          O = !0, v.abort(), h = D(f.chunk) ? "" : h.substring(v.getCharIndex());
        }, this.resume = function() {
          x.streamer._halted ? (O = !1, x.streamer.parseChunk(h, !0)) : setTimeout(x.resume, 3);
        }, this.aborted = function() {
          return E;
        }, this.abort = function() {
          E = !0, v.abort(), A.meta.aborted = !0, D(f.complete) && f.complete(A), h = "";
        }, this.guessLineEndings = function(y, T) {
          y = y.substring(0, 1048576);
          var T = new RegExp(Z(T) + "([^]*?)" + Z(T), "gm"), I = (y = y.replace(T, "")).split("\r"), T = y.split(`
`), y = 1 < T.length && T[0].length < I[0].length;
          if (I.length === 1 || y) return `
`;
          for (var K = 0, $ = 0; $ < I.length; $++) I[$][0] === `
` && K++;
          return K >= I.length / 2 ? `\r
` : "\r";
        };
      }
      function Z(f) {
        return f.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      }
      function N(f) {
        var h = (f = f || {}).delimiter, v = f.newline, S = f.comments, C = f.step, P = f.preview, d = f.fastMode, M = null, _ = !1, x = f.quoteChar == null ? '"' : f.quoteChar, R = x;
        if (f.escapeChar !== void 0 && (R = f.escapeChar), (typeof h != "string" || -1 < s.BAD_DELIMITERS.indexOf(h)) && (h = ","), S === h) throw new Error("Comment character same as delimiter");
        S === !0 ? S = "#" : (typeof S != "string" || -1 < s.BAD_DELIMITERS.indexOf(S)) && (S = !1), v !== `
` && v !== "\r" && v !== `\r
` && (v = `
`);
        var k = 0, O = !1;
        this.parse = function(E, L, A) {
          if (typeof E != "string") throw new Error("Input must be a string");
          var B = E.length, G = h.length, j = v.length, tt = S.length, Y = D(C), w = [], I = [], T = [], y = k = 0;
          if (!E) return at();
          if (d || d !== !1 && E.indexOf(x) === -1) {
            for (var K = E.split(v), $ = 0; $ < K.length; $++) {
              if (T = K[$], k += T.length, $ !== K.length - 1) k += v.length;
              else if (A) return at();
              if (!S || T.substring(0, tt) !== S) {
                if (Y) {
                  if (w = [], Et(T.split(h)), gt(), O) return at();
                } else Et(T.split(h));
                if (P && P <= $) return w = w.slice(0, P), at(!0);
              }
            }
            return at();
          }
          for (var V = E.indexOf(h, k), H = E.indexOf(v, k), nt = new RegExp(Z(R) + Z(x), "g"), W = E.indexOf(x, k); ; ) if (E[k] === x) for (W = k, k++; ; ) {
            if ((W = E.indexOf(x, W + 1)) === -1) return A || I.push({ type: "Quotes", code: "MissingQuotes", message: "Quoted field unterminated", row: w.length, index: k }), pt();
            if (W === B - 1) return pt(E.substring(k, W).replace(nt, x));
            if (x === R && E[W + 1] === R) W++;
            else if (x === R || W === 0 || E[W - 1] !== R) {
              V !== -1 && V < W + 1 && (V = E.indexOf(h, W + 1));
              var et = zt((H = H !== -1 && H < W + 1 ? E.indexOf(v, W + 1) : H) === -1 ? V : Math.min(V, H));
              if (E.substr(W + 1 + et, G) === h) {
                T.push(E.substring(k, W).replace(nt, x)), E[k = W + 1 + et + G] !== x && (W = E.indexOf(x, k)), V = E.indexOf(h, k), H = E.indexOf(v, k);
                break;
              }
              if (et = zt(H), E.substring(W + 1 + et, W + 1 + et + j) === v) {
                if (T.push(E.substring(k, W).replace(nt, x)), Gt(W + 1 + et + j), V = E.indexOf(h, k), W = E.indexOf(x, k), Y && (gt(), O)) return at();
                if (P && w.length >= P) return at(!0);
                break;
              }
              I.push({ type: "Quotes", code: "InvalidQuotes", message: "Trailing quote on quoted field is malformed", row: w.length, index: k }), W++;
            }
          }
          else if (S && T.length === 0 && E.substring(k, k + tt) === S) {
            if (H === -1) return at();
            k = H + j, H = E.indexOf(v, k), V = E.indexOf(h, k);
          } else if (V !== -1 && (V < H || H === -1)) T.push(E.substring(k, V)), k = V + G, V = E.indexOf(h, k);
          else {
            if (H === -1) break;
            if (T.push(E.substring(k, H)), Gt(H + j), Y && (gt(), O)) return at();
            if (P && w.length >= P) return at(!0);
          }
          return pt();
          function Et(it) {
            w.push(it), y = k;
          }
          function zt(it) {
            var st = 0;
            return st = it !== -1 && (it = E.substring(W + 1, it)) && it.trim() === "" ? it.length : st;
          }
          function pt(it) {
            return A || (it === void 0 && (it = E.substring(k)), T.push(it), k = B, Et(T), Y && gt()), at();
          }
          function Gt(it) {
            k = it, Et(T), T = [], H = E.indexOf(v, k);
          }
          function at(it) {
            if (f.header && !L && w.length && !_) {
              var st = w[0], _t = /* @__PURE__ */ Object.create(null), ze = new Set(st);
              let xn = !1;
              for (let Ot = 0; Ot < st.length; Ot++) {
                let mt = st[Ot];
                if (_t[mt = D(f.transformHeader) ? f.transformHeader(mt, Ot) : mt]) {
                  let Kt, bn = _t[mt];
                  for (; Kt = mt + "_" + bn, bn++, ze.has(Kt); ) ;
                  ze.add(Kt), st[Ot] = Kt, _t[mt]++, xn = !0, (M = M === null ? {} : M)[Kt] = mt;
                } else _t[mt] = 1, st[Ot] = mt;
                ze.add(mt);
              }
              xn && console.warn("Duplicate headers found and renamed."), _ = !0;
            }
            return { data: w, errors: I, meta: { delimiter: h, linebreak: v, aborted: O, truncated: !!it, cursor: y + (L || 0), renamedHeaders: M } };
          }
          function gt() {
            C(at()), w = [], I = [];
          }
        }, this.abort = function() {
          O = !0;
        }, this.getCharIndex = function() {
          return k;
        };
      }
      function J(f) {
        var h = f.data, v = u[h.workerId], S = !1;
        if (h.error) v.userError(h.error, h.file);
        else if (h.results && h.results.data) {
          var C = { abort: function() {
            S = !0, X(h.workerId, { data: [], errors: [], meta: { aborted: !0 } });
          }, pause: F, resume: F };
          if (D(v.userStep)) {
            for (var P = 0; P < h.results.data.length && (v.userStep({ data: h.results.data[P], errors: h.results.errors, meta: h.results.meta }, C), !S); P++) ;
            delete h.results;
          } else D(v.userChunk) && (v.userChunk(h.results, C, h.file), delete h.results);
        }
        h.finished && !S && X(h.workerId, h.results);
      }
      function X(f, h) {
        var v = u[f];
        D(v.userComplete) && v.userComplete(h), v.terminate(), delete u[f];
      }
      function F() {
        throw new Error("Not implemented.");
      }
      function U(f) {
        if (typeof f != "object" || f === null) return f;
        var h, v = Array.isArray(f) ? [] : {};
        for (h in f) v[h] = U(f[h]);
        return v;
      }
      function b(f, h) {
        return function() {
          f.apply(h, arguments);
        };
      }
      function D(f) {
        return typeof f == "function";
      }
      return s.parse = function(f, h) {
        var v = (h = h || {}).dynamicTyping || !1;
        if (D(v) && (h.dynamicTypingFunction = v, v = {}), h.dynamicTyping = v, h.transform = !!D(h.transform) && h.transform, !h.worker || !s.WORKERS_SUPPORTED) return v = null, s.NODE_STREAM_INPUT, typeof f == "string" ? (f = ((S) => S.charCodeAt(0) !== 65279 ? S : S.slice(1))(f), v = new (h.download ? m : g)(h)) : f.readable === !0 && D(f.read) && D(f.on) ? v = new z(h) : (r.File && f instanceof File || f instanceof Object) && (v = new p(h)), v.stream(f);
        (v = (() => {
          var S;
          return !!s.WORKERS_SUPPORTED && (S = (() => {
            var C = r.URL || r.webkitURL || null, P = n.toString();
            return s.BLOB_URL || (s.BLOB_URL = C.createObjectURL(new Blob(["var global = (function() { if (typeof self !== 'undefined') { return self; } if (typeof window !== 'undefined') { return window; } if (typeof global !== 'undefined') { return global; } return {}; })(); global.IS_PAPA_WORKER=true; ", "(", P, ")();"], { type: "text/javascript" })));
          })(), (S = new r.Worker(S)).onmessage = J, S.id = l++, u[S.id] = S);
        })()).userStep = h.step, v.userChunk = h.chunk, v.userComplete = h.complete, v.userError = h.error, h.step = D(h.step), h.chunk = D(h.chunk), h.complete = D(h.complete), h.error = D(h.error), delete h.worker, v.postMessage({ input: f, config: h, workerId: v.id });
      }, s.unparse = function(f, h) {
        var v = !1, S = !0, C = ",", P = `\r
`, d = '"', M = d + d, _ = !1, x = null, R = !1, k = ((() => {
          if (typeof h == "object") {
            if (typeof h.delimiter != "string" || s.BAD_DELIMITERS.filter(function(L) {
              return h.delimiter.indexOf(L) !== -1;
            }).length || (C = h.delimiter), typeof h.quotes != "boolean" && typeof h.quotes != "function" && !Array.isArray(h.quotes) || (v = h.quotes), typeof h.skipEmptyLines != "boolean" && typeof h.skipEmptyLines != "string" || (_ = h.skipEmptyLines), typeof h.newline == "string" && (P = h.newline), typeof h.quoteChar == "string" && (d = h.quoteChar), typeof h.header == "boolean" && (S = h.header), Array.isArray(h.columns)) {
              if (h.columns.length === 0) throw new Error("Option columns is empty");
              x = h.columns;
            }
            h.escapeChar !== void 0 && (M = h.escapeChar + d), h.escapeFormulae instanceof RegExp ? R = h.escapeFormulae : typeof h.escapeFormulae == "boolean" && h.escapeFormulae && (R = /^[=+\-@\t\r].*$/);
          }
        })(), new RegExp(Z(d), "g"));
        if (typeof f == "string" && (f = JSON.parse(f)), Array.isArray(f)) {
          if (!f.length || Array.isArray(f[0])) return O(null, f, _);
          if (typeof f[0] == "object") return O(x || Object.keys(f[0]), f, _);
        } else if (typeof f == "object") return typeof f.data == "string" && (f.data = JSON.parse(f.data)), Array.isArray(f.data) && (f.fields || (f.fields = f.meta && f.meta.fields || x), f.fields || (f.fields = Array.isArray(f.data[0]) ? f.fields : typeof f.data[0] == "object" ? Object.keys(f.data[0]) : []), Array.isArray(f.data[0]) || typeof f.data[0] == "object" || (f.data = [f.data])), O(f.fields || [], f.data || [], _);
        throw new Error("Unable to serialize unrecognized input");
        function O(L, A, B) {
          var G = "", j = (typeof L == "string" && (L = JSON.parse(L)), typeof A == "string" && (A = JSON.parse(A)), Array.isArray(L) && 0 < L.length), tt = !Array.isArray(A[0]);
          if (j && S) {
            for (var Y = 0; Y < L.length; Y++) 0 < Y && (G += C), G += E(L[Y], Y);
            0 < A.length && (G += P);
          }
          for (var w = 0; w < A.length; w++) {
            var I = (j ? L : A[w]).length, T = !1, y = j ? Object.keys(A[w]).length === 0 : A[w].length === 0;
            if (B && !j && (T = B === "greedy" ? A[w].join("").trim() === "" : A[w].length === 1 && A[w][0].length === 0), B === "greedy" && j) {
              for (var K = [], $ = 0; $ < I; $++) {
                var V = tt ? L[$] : $;
                K.push(A[w][V]);
              }
              T = K.join("").trim() === "";
            }
            if (!T) {
              for (var H = 0; H < I; H++) {
                0 < H && !y && (G += C);
                var nt = j && tt ? L[H] : H;
                G += E(A[w][nt], H);
              }
              w < A.length - 1 && (!B || 0 < I && !y) && (G += P);
            }
          }
          return G;
        }
        function E(L, A) {
          var B, G;
          return L == null ? "" : L.constructor === Date ? JSON.stringify(L).slice(1, 25) : (G = !1, R && typeof L == "string" && R.test(L) && (L = "'" + L, G = !0), B = L.toString().replace(k, M), (G = G || v === !0 || typeof v == "function" && v(L, A) || Array.isArray(v) && v[A] || ((j, tt) => {
            for (var Y = 0; Y < tt.length; Y++) if (-1 < j.indexOf(tt[Y])) return !0;
            return !1;
          })(B, s.BAD_DELIMITERS) || -1 < B.indexOf(C) || B.charAt(0) === " " || B.charAt(B.length - 1) === " ") ? d + B + d : B);
        }
      }, s.RECORD_SEP = "", s.UNIT_SEP = "", s.BYTE_ORDER_MARK = "\uFEFF", s.BAD_DELIMITERS = ["\r", `
`, '"', s.BYTE_ORDER_MARK], s.WORKERS_SUPPORTED = !a && !!r.Worker, s.NODE_STREAM_INPUT = 1, s.LocalChunkSize = 10485760, s.RemoteChunkSize = 5242880, s.DefaultDelimiter = ",", s.Parser = N, s.ParserHandle = q, s.NetworkStreamer = m, s.FileStreamer = p, s.StringStreamer = g, s.ReadableStreamStreamer = z, r.jQuery && ((i = r.jQuery).fn.parse = function(f) {
        var h = f.config || {}, v = [];
        return this.each(function(P) {
          if (!(i(this).prop("tagName").toUpperCase() === "INPUT" && i(this).attr("type").toLowerCase() === "file" && r.FileReader) || !this.files || this.files.length === 0) return !0;
          for (var d = 0; d < this.files.length; d++) v.push({ file: this.files[d], inputElem: this, instanceConfig: i.extend({}, h) });
        }), S(), this;
        function S() {
          if (v.length === 0) D(f.complete) && f.complete();
          else {
            var P, d, M, _, x = v[0];
            if (D(f.before)) {
              var R = f.before(x.file, x.inputElem);
              if (typeof R == "object") {
                if (R.action === "abort") return P = "AbortError", d = x.file, M = x.inputElem, _ = R.reason, void (D(f.error) && f.error({ name: P }, d, M, _));
                if (R.action === "skip") return void C();
                typeof R.config == "object" && (x.instanceConfig = i.extend(x.instanceConfig, R.config));
              } else if (R === "skip") return void C();
            }
            var k = x.instanceConfig.complete;
            x.instanceConfig.complete = function(O) {
              D(k) && k(O, x.file, x.inputElem), C();
            }, s.parse(x.file, x.instanceConfig);
          }
        }
        function C() {
          v.splice(0, 1), S();
        }
      }), o && (r.onmessage = function(f) {
        f = f.data, s.WORKER_ID === void 0 && f && (s.WORKER_ID = f.workerId), typeof f.input == "string" ? r.postMessage({ workerId: s.WORKER_ID, results: s.parse(f.input, f.config), finished: !0 }) : (r.File && f.input instanceof File || f.input instanceof Object) && (f = s.parse(f.input, f.config)) && r.postMessage({ workerId: s.WORKER_ID, results: f, finished: !0 });
      }), (m.prototype = Object.create(c.prototype)).constructor = m, (p.prototype = Object.create(c.prototype)).constructor = p, (g.prototype = Object.create(g.prototype)).constructor = g, (z.prototype = Object.create(c.prototype)).constructor = z, s;
    });
  }(ye)), ye.exports;
}
var Wr = qr();
const Vr = /* @__PURE__ */ Yr(Wr);
class Br {
  static parse(e) {
    return Vr.parse(e, {
      header: !0,
      skipEmptyLines: !0
    }).data.map((r) => ({
      title: r.title,
      start: new Date(r.start),
      end: r.end ? new Date(r.end) : void 0,
      description: r.description,
      background: r.backgroundType ? {
        type: r.backgroundType,
        source: r.backgroundSource,
        overlayColor: r.overlayColor
      } : void 0,
      metadata: r.metadata ? JSON.parse(r.metadata) : {}
    }));
  }
}
class Xr {
  static parse(e) {
    return (typeof e == "string" ? JSON.parse(e) : e).items.map((r) => ({
      title: r.title,
      start: new Date(r.start),
      end: r.end ? new Date(r.end) : void 0,
      description: r.description,
      background: r.background,
      metadata: r.metadata
    }));
  }
}
class Zr {
  static parse(e) {
    const r = new DOMParser().parseFromString(e, "application/xml"), i = [];
    return r.querySelectorAll("item").forEach((a) => {
      const o = (u) => a.querySelector(u)?.textContent || "";
      i.push({
        title: o("title"),
        start: new Date(o("start")),
        end: a.querySelector("end") ? new Date(o("end")) : void 0,
        description: o("description")
        // προσαρμόζεις selectors για background & metadata αν χρειάζεται
      });
    }), i;
  }
}
class Gr {
  static parse(e) {
    const r = new DOMParser().parseFromString(e, "application/xml"), i = [];
    return r.querySelectorAll("listEvent event").forEach((a) => {
      const o = (u) => a.querySelector(u)?.textContent?.trim() || "";
      i.push({
        title: o("title") || o("desc"),
        // π.χ. <title> ή <desc>
        start: new Date(o("date")),
        // π.χ. <date when="YYYY-MM-DD"/>
        end: void 0,
        // αν χρειάζεται, μπορείς να τυπώσεις άλλη ημερομηνία
        description: o("desc"),
        metadata: {
          // Αν το TEI έχει attributes, π.χ. @when
          when: a.getAttribute("when"),
          type: a.getAttribute("type")
        }
      });
    }), i;
  }
}
class he {
  static parse(e, n) {
    switch (n) {
      case "csv":
        return Br.parse(e);
      case "json":
        return Xr.parse(e);
      case "xml":
        return Zr.parse(e);
      case "tei":
        return Gr.parse(e);
      default:
        throw new Error(`Unsupported data type: ${n}`);
    }
  }
}
function ve(t, e) {
  return t == null || e == null ? NaN : t < e ? -1 : t > e ? 1 : t >= e ? 0 : NaN;
}
function Kr(t, e) {
  return t == null || e == null ? NaN : e < t ? -1 : e > t ? 1 : e >= t ? 0 : NaN;
}
function an(t) {
  let e, n, r;
  t.length !== 2 ? (e = ve, n = (u, l) => ve(t(u), l), r = (u, l) => t(u) - l) : (e = t === ve || t === Kr ? t : Qr, n = t, r = t);
  function i(u, l, s = 0, c = u.length) {
    if (s < c) {
      if (e(l, l) !== 0) return c;
      do {
        const m = s + c >>> 1;
        n(u[m], l) < 0 ? s = m + 1 : c = m;
      } while (s < c);
    }
    return s;
  }
  function a(u, l, s = 0, c = u.length) {
    if (s < c) {
      if (e(l, l) !== 0) return c;
      do {
        const m = s + c >>> 1;
        n(u[m], l) <= 0 ? s = m + 1 : c = m;
      } while (s < c);
    }
    return s;
  }
  function o(u, l, s = 0, c = u.length) {
    const m = i(u, l, s, c - 1);
    return m > s && r(u[m - 1], l) > -r(u[m], l) ? m - 1 : m;
  }
  return { left: i, center: o, right: a };
}
function Qr() {
  return 0;
}
function Jr(t) {
  return t === null ? NaN : +t;
}
const jr = an(ve), ti = jr.right;
an(Jr).center;
function or(t, e) {
  let n, r;
  for (const i of t)
    i != null && (n === void 0 ? i >= i && (n = r = i) : (n > i && (n = i), r < i && (r = i)));
  return [n, r];
}
const ei = Math.sqrt(50), ni = Math.sqrt(10), ri = Math.sqrt(2);
function ar(t, e, n) {
  const r = (e - t) / Math.max(0, n), i = Math.floor(Math.log10(r)), a = r / Math.pow(10, i), o = a >= ei ? 10 : a >= ni ? 5 : a >= ri ? 2 : 1;
  let u, l, s;
  return i < 0 ? (s = Math.pow(10, -i) / o, u = Math.round(t * s), l = Math.round(e * s), u / s < t && ++u, l / s > e && --l, s = -s) : (s = Math.pow(10, i) * o, u = Math.round(t / s), l = Math.round(e / s), u * s < t && ++u, l * s > e && --l), l < u && 0.5 <= n && n < 2 ? ar(t, e, n * 2) : [u, l, s];
}
function Tn(t, e, n) {
  return e = +e, t = +t, n = +n, ar(t, e, n)[2];
}
function Cn(t, e, n) {
  e = +e, t = +t, n = +n;
  const r = e < t, i = r ? Tn(e, t, n) : Tn(t, e, n);
  return (r ? -1 : 1) * (i < 0 ? 1 / -i : i);
}
function ii(t) {
  return t;
}
var Oe = 1, $e = 2, Ze = 3, ne = 4, Mn = 1e-6;
function oi(t) {
  return "translate(" + t + ",0)";
}
function ai(t) {
  return "translate(0," + t + ")";
}
function si(t) {
  return (e) => +t(e);
}
function ui(t, e) {
  return e = Math.max(0, t.bandwidth() - e * 2) / 2, t.round() && (e = Math.round(e)), (n) => +t(n) + e;
}
function li() {
  return !this.__axis;
}
function sr(t, e) {
  var n = [], r = null, i = null, a = 6, o = 6, u = 3, l = typeof window < "u" && window.devicePixelRatio > 1 ? 0 : 0.5, s = t === Oe || t === ne ? -1 : 1, c = t === ne || t === $e ? "x" : "y", m = t === Oe || t === Ze ? oi : ai;
  function p(g) {
    var z = r ?? (e.ticks ? e.ticks.apply(e, n) : e.domain()), q = i ?? (e.tickFormat ? e.tickFormat.apply(e, n) : ii), Z = Math.max(a, 0) + u, N = e.range(), J = +N[0] + l, X = +N[N.length - 1] + l, F = (e.bandwidth ? ui : si)(e.copy(), l), U = g.selection ? g.selection() : g, b = U.selectAll(".domain").data([null]), D = U.selectAll(".tick").data(z, e).order(), f = D.exit(), h = D.enter().append("g").attr("class", "tick"), v = D.select("line"), S = D.select("text");
    b = b.merge(b.enter().insert("path", ".tick").attr("class", "domain").attr("stroke", "currentColor")), D = D.merge(h), v = v.merge(h.append("line").attr("stroke", "currentColor").attr(c + "2", s * a)), S = S.merge(h.append("text").attr("fill", "currentColor").attr(c, s * Z).attr("dy", t === Oe ? "0em" : t === Ze ? "0.71em" : "0.32em")), g !== U && (b = b.transition(g), D = D.transition(g), v = v.transition(g), S = S.transition(g), f = f.transition(g).attr("opacity", Mn).attr("transform", function(C) {
      return isFinite(C = F(C)) ? m(C + l) : this.getAttribute("transform");
    }), h.attr("opacity", Mn).attr("transform", function(C) {
      var P = this.parentNode.__axis;
      return m((P && isFinite(P = P(C)) ? P : F(C)) + l);
    })), f.remove(), b.attr("d", t === ne || t === $e ? o ? "M" + s * o + "," + J + "H" + l + "V" + X + "H" + s * o : "M" + l + "," + J + "V" + X : o ? "M" + J + "," + s * o + "V" + l + "H" + X + "V" + s * o : "M" + J + "," + l + "H" + X), D.attr("opacity", 1).attr("transform", function(C) {
      return m(F(C) + l);
    }), v.attr(c + "2", s * a), S.attr(c, s * Z).text(q), U.filter(li).attr("fill", "none").attr("font-size", 10).attr("font-family", "sans-serif").attr("text-anchor", t === $e ? "start" : t === ne ? "end" : "middle"), U.each(function() {
      this.__axis = F;
    });
  }
  return p.scale = function(g) {
    return arguments.length ? (e = g, p) : e;
  }, p.ticks = function() {
    return n = Array.from(arguments), p;
  }, p.tickArguments = function(g) {
    return arguments.length ? (n = g == null ? [] : Array.from(g), p) : n.slice();
  }, p.tickValues = function(g) {
    return arguments.length ? (r = g == null ? null : Array.from(g), p) : r && r.slice();
  }, p.tickFormat = function(g) {
    return arguments.length ? (i = g, p) : i;
  }, p.tickSize = function(g) {
    return arguments.length ? (a = o = +g, p) : a;
  }, p.tickSizeInner = function(g) {
    return arguments.length ? (a = +g, p) : a;
  }, p.tickSizeOuter = function(g) {
    return arguments.length ? (o = +g, p) : o;
  }, p.tickPadding = function(g) {
    return arguments.length ? (u = +g, p) : u;
  }, p.offset = function(g) {
    return arguments.length ? (l = +g, p) : l;
  }, p;
}
function Sn(t) {
  return sr(Ze, t);
}
function En(t) {
  return sr(ne, t);
}
var ci = { value: () => {
} };
function sn() {
  for (var t = 0, e = arguments.length, n = {}, r; t < e; ++t) {
    if (!(r = arguments[t] + "") || r in n || /[\s.]/.test(r)) throw new Error("illegal type: " + r);
    n[r] = [];
  }
  return new _e(n);
}
function _e(t) {
  this._ = t;
}
function fi(t, e) {
  return t.trim().split(/^|\s+/).map(function(n) {
    var r = "", i = n.indexOf(".");
    if (i >= 0 && (r = n.slice(i + 1), n = n.slice(0, i)), n && !e.hasOwnProperty(n)) throw new Error("unknown type: " + n);
    return { type: n, name: r };
  });
}
_e.prototype = sn.prototype = {
  constructor: _e,
  on: function(t, e) {
    var n = this._, r = fi(t + "", n), i, a = -1, o = r.length;
    if (arguments.length < 2) {
      for (; ++a < o; ) if ((i = (t = r[a]).type) && (i = hi(n[i], t.name))) return i;
      return;
    }
    if (e != null && typeof e != "function") throw new Error("invalid callback: " + e);
    for (; ++a < o; )
      if (i = (t = r[a]).type) n[i] = Dn(n[i], t.name, e);
      else if (e == null) for (i in n) n[i] = Dn(n[i], t.name, null);
    return this;
  },
  copy: function() {
    var t = {}, e = this._;
    for (var n in e) t[n] = e[n].slice();
    return new _e(t);
  },
  call: function(t, e) {
    if ((i = arguments.length - 2) > 0) for (var n = new Array(i), r = 0, i, a; r < i; ++r) n[r] = arguments[r + 2];
    if (!this._.hasOwnProperty(t)) throw new Error("unknown type: " + t);
    for (a = this._[t], r = 0, i = a.length; r < i; ++r) a[r].value.apply(e, n);
  },
  apply: function(t, e, n) {
    if (!this._.hasOwnProperty(t)) throw new Error("unknown type: " + t);
    for (var r = this._[t], i = 0, a = r.length; i < a; ++i) r[i].value.apply(e, n);
  }
};
function hi(t, e) {
  for (var n = 0, r = t.length, i; n < r; ++n)
    if ((i = t[n]).name === e)
      return i.value;
}
function Dn(t, e, n) {
  for (var r = 0, i = t.length; r < i; ++r)
    if (t[r].name === e) {
      t[r] = ci, t = t.slice(0, r).concat(t.slice(r + 1));
      break;
    }
  return n != null && t.push({ name: e, value: n }), t;
}
var Ge = "http://www.w3.org/1999/xhtml";
const An = {
  svg: "http://www.w3.org/2000/svg",
  xhtml: Ge,
  xlink: "http://www.w3.org/1999/xlink",
  xml: "http://www.w3.org/XML/1998/namespace",
  xmlns: "http://www.w3.org/2000/xmlns/"
};
function Ue(t) {
  var e = t += "", n = e.indexOf(":");
  return n >= 0 && (e = t.slice(0, n)) !== "xmlns" && (t = t.slice(n + 1)), An.hasOwnProperty(e) ? { space: An[e], local: t } : t;
}
function di(t) {
  return function() {
    var e = this.ownerDocument, n = this.namespaceURI;
    return n === Ge && e.documentElement.namespaceURI === Ge ? e.createElement(t) : e.createElementNS(n, t);
  };
}
function pi(t) {
  return function() {
    return this.ownerDocument.createElementNS(t.space, t.local);
  };
}
function ur(t) {
  var e = Ue(t);
  return (e.local ? pi : di)(e);
}
function gi() {
}
function un(t) {
  return t == null ? gi : function() {
    return this.querySelector(t);
  };
}
function mi(t) {
  typeof t != "function" && (t = un(t));
  for (var e = this._groups, n = e.length, r = new Array(n), i = 0; i < n; ++i)
    for (var a = e[i], o = a.length, u = r[i] = new Array(o), l, s, c = 0; c < o; ++c)
      (l = a[c]) && (s = t.call(l, l.__data__, c, a)) && ("__data__" in l && (s.__data__ = l.__data__), u[c] = s);
  return new lt(r, this._parents);
}
function yi(t) {
  return t == null ? [] : Array.isArray(t) ? t : Array.from(t);
}
function vi() {
  return [];
}
function lr(t) {
  return t == null ? vi : function() {
    return this.querySelectorAll(t);
  };
}
function _i(t) {
  return function() {
    return yi(t.apply(this, arguments));
  };
}
function wi(t) {
  typeof t == "function" ? t = _i(t) : t = lr(t);
  for (var e = this._groups, n = e.length, r = [], i = [], a = 0; a < n; ++a)
    for (var o = e[a], u = o.length, l, s = 0; s < u; ++s)
      (l = o[s]) && (r.push(t.call(l, l.__data__, s, o)), i.push(l));
  return new lt(r, i);
}
function cr(t) {
  return function() {
    return this.matches(t);
  };
}
function fr(t) {
  return function(e) {
    return e.matches(t);
  };
}
var xi = Array.prototype.find;
function bi(t) {
  return function() {
    return xi.call(this.children, t);
  };
}
function ki() {
  return this.firstElementChild;
}
function Ti(t) {
  return this.select(t == null ? ki : bi(typeof t == "function" ? t : fr(t)));
}
var Ci = Array.prototype.filter;
function Mi() {
  return Array.from(this.children);
}
function Si(t) {
  return function() {
    return Ci.call(this.children, t);
  };
}
function Ei(t) {
  return this.selectAll(t == null ? Mi : Si(typeof t == "function" ? t : fr(t)));
}
function Di(t) {
  typeof t != "function" && (t = cr(t));
  for (var e = this._groups, n = e.length, r = new Array(n), i = 0; i < n; ++i)
    for (var a = e[i], o = a.length, u = r[i] = [], l, s = 0; s < o; ++s)
      (l = a[s]) && t.call(l, l.__data__, s, a) && u.push(l);
  return new lt(r, this._parents);
}
function hr(t) {
  return new Array(t.length);
}
function Ai() {
  return new lt(this._enter || this._groups.map(hr), this._parents);
}
function ke(t, e) {
  this.ownerDocument = t.ownerDocument, this.namespaceURI = t.namespaceURI, this._next = null, this._parent = t, this.__data__ = e;
}
ke.prototype = {
  constructor: ke,
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
function Ni(t) {
  return function() {
    return t;
  };
}
function Ri(t, e, n, r, i, a) {
  for (var o = 0, u, l = e.length, s = a.length; o < s; ++o)
    (u = e[o]) ? (u.__data__ = a[o], r[o] = u) : n[o] = new ke(t, a[o]);
  for (; o < l; ++o)
    (u = e[o]) && (i[o] = u);
}
function Ui(t, e, n, r, i, a, o) {
  var u, l, s = /* @__PURE__ */ new Map(), c = e.length, m = a.length, p = new Array(c), g;
  for (u = 0; u < c; ++u)
    (l = e[u]) && (p[u] = g = o.call(l, l.__data__, u, e) + "", s.has(g) ? i[u] = l : s.set(g, l));
  for (u = 0; u < m; ++u)
    g = o.call(t, a[u], u, a) + "", (l = s.get(g)) ? (r[u] = l, l.__data__ = a[u], s.delete(g)) : n[u] = new ke(t, a[u]);
  for (u = 0; u < c; ++u)
    (l = e[u]) && s.get(p[u]) === l && (i[u] = l);
}
function Fi(t) {
  return t.__data__;
}
function Li(t, e) {
  if (!arguments.length) return Array.from(this, Fi);
  var n = e ? Ui : Ri, r = this._parents, i = this._groups;
  typeof t != "function" && (t = Ni(t));
  for (var a = i.length, o = new Array(a), u = new Array(a), l = new Array(a), s = 0; s < a; ++s) {
    var c = r[s], m = i[s], p = m.length, g = Ii(t.call(c, c && c.__data__, s, r)), z = g.length, q = u[s] = new Array(z), Z = o[s] = new Array(z), N = l[s] = new Array(p);
    n(c, m, q, Z, N, g, e);
    for (var J = 0, X = 0, F, U; J < z; ++J)
      if (F = q[J]) {
        for (J >= X && (X = J + 1); !(U = Z[X]) && ++X < z; ) ;
        F._next = U || null;
      }
  }
  return o = new lt(o, r), o._enter = u, o._exit = l, o;
}
function Ii(t) {
  return typeof t == "object" && "length" in t ? t : Array.from(t);
}
function zi() {
  return new lt(this._exit || this._groups.map(hr), this._parents);
}
function Oi(t, e, n) {
  var r = this.enter(), i = this, a = this.exit();
  return typeof t == "function" ? (r = t(r), r && (r = r.selection())) : r = r.append(t + ""), e != null && (i = e(i), i && (i = i.selection())), n == null ? a.remove() : n(a), r && i ? r.merge(i).order() : i;
}
function $i(t) {
  for (var e = t.selection ? t.selection() : t, n = this._groups, r = e._groups, i = n.length, a = r.length, o = Math.min(i, a), u = new Array(i), l = 0; l < o; ++l)
    for (var s = n[l], c = r[l], m = s.length, p = u[l] = new Array(m), g, z = 0; z < m; ++z)
      (g = s[z] || c[z]) && (p[z] = g);
  for (; l < i; ++l)
    u[l] = n[l];
  return new lt(u, this._parents);
}
function Hi() {
  for (var t = this._groups, e = -1, n = t.length; ++e < n; )
    for (var r = t[e], i = r.length - 1, a = r[i], o; --i >= 0; )
      (o = r[i]) && (a && o.compareDocumentPosition(a) ^ 4 && a.parentNode.insertBefore(o, a), a = o);
  return this;
}
function Yi(t) {
  t || (t = Pi);
  function e(m, p) {
    return m && p ? t(m.__data__, p.__data__) : !m - !p;
  }
  for (var n = this._groups, r = n.length, i = new Array(r), a = 0; a < r; ++a) {
    for (var o = n[a], u = o.length, l = i[a] = new Array(u), s, c = 0; c < u; ++c)
      (s = o[c]) && (l[c] = s);
    l.sort(e);
  }
  return new lt(i, this._parents).order();
}
function Pi(t, e) {
  return t < e ? -1 : t > e ? 1 : t >= e ? 0 : NaN;
}
function qi() {
  var t = arguments[0];
  return arguments[0] = this, t.apply(null, arguments), this;
}
function Wi() {
  return Array.from(this);
}
function Vi() {
  for (var t = this._groups, e = 0, n = t.length; e < n; ++e)
    for (var r = t[e], i = 0, a = r.length; i < a; ++i) {
      var o = r[i];
      if (o) return o;
    }
  return null;
}
function Bi() {
  let t = 0;
  for (const e of this) ++t;
  return t;
}
function Xi() {
  return !this.node();
}
function Zi(t) {
  for (var e = this._groups, n = 0, r = e.length; n < r; ++n)
    for (var i = e[n], a = 0, o = i.length, u; a < o; ++a)
      (u = i[a]) && t.call(u, u.__data__, a, i);
  return this;
}
function Gi(t) {
  return function() {
    this.removeAttribute(t);
  };
}
function Ki(t) {
  return function() {
    this.removeAttributeNS(t.space, t.local);
  };
}
function Qi(t, e) {
  return function() {
    this.setAttribute(t, e);
  };
}
function Ji(t, e) {
  return function() {
    this.setAttributeNS(t.space, t.local, e);
  };
}
function ji(t, e) {
  return function() {
    var n = e.apply(this, arguments);
    n == null ? this.removeAttribute(t) : this.setAttribute(t, n);
  };
}
function to(t, e) {
  return function() {
    var n = e.apply(this, arguments);
    n == null ? this.removeAttributeNS(t.space, t.local) : this.setAttributeNS(t.space, t.local, n);
  };
}
function eo(t, e) {
  var n = Ue(t);
  if (arguments.length < 2) {
    var r = this.node();
    return n.local ? r.getAttributeNS(n.space, n.local) : r.getAttribute(n);
  }
  return this.each((e == null ? n.local ? Ki : Gi : typeof e == "function" ? n.local ? to : ji : n.local ? Ji : Qi)(n, e));
}
function dr(t) {
  return t.ownerDocument && t.ownerDocument.defaultView || t.document && t || t.defaultView;
}
function no(t) {
  return function() {
    this.style.removeProperty(t);
  };
}
function ro(t, e, n) {
  return function() {
    this.style.setProperty(t, e, n);
  };
}
function io(t, e, n) {
  return function() {
    var r = e.apply(this, arguments);
    r == null ? this.style.removeProperty(t) : this.style.setProperty(t, r, n);
  };
}
function oo(t, e, n) {
  return arguments.length > 1 ? this.each((e == null ? no : typeof e == "function" ? io : ro)(t, e, n ?? "")) : qt(this.node(), t);
}
function qt(t, e) {
  return t.style.getPropertyValue(e) || dr(t).getComputedStyle(t, null).getPropertyValue(e);
}
function ao(t) {
  return function() {
    delete this[t];
  };
}
function so(t, e) {
  return function() {
    this[t] = e;
  };
}
function uo(t, e) {
  return function() {
    var n = e.apply(this, arguments);
    n == null ? delete this[t] : this[t] = n;
  };
}
function lo(t, e) {
  return arguments.length > 1 ? this.each((e == null ? ao : typeof e == "function" ? uo : so)(t, e)) : this.node()[t];
}
function pr(t) {
  return t.trim().split(/^|\s+/);
}
function ln(t) {
  return t.classList || new gr(t);
}
function gr(t) {
  this._node = t, this._names = pr(t.getAttribute("class") || "");
}
gr.prototype = {
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
function mr(t, e) {
  for (var n = ln(t), r = -1, i = e.length; ++r < i; ) n.add(e[r]);
}
function yr(t, e) {
  for (var n = ln(t), r = -1, i = e.length; ++r < i; ) n.remove(e[r]);
}
function co(t) {
  return function() {
    mr(this, t);
  };
}
function fo(t) {
  return function() {
    yr(this, t);
  };
}
function ho(t, e) {
  return function() {
    (e.apply(this, arguments) ? mr : yr)(this, t);
  };
}
function po(t, e) {
  var n = pr(t + "");
  if (arguments.length < 2) {
    for (var r = ln(this.node()), i = -1, a = n.length; ++i < a; ) if (!r.contains(n[i])) return !1;
    return !0;
  }
  return this.each((typeof e == "function" ? ho : e ? co : fo)(n, e));
}
function go() {
  this.textContent = "";
}
function mo(t) {
  return function() {
    this.textContent = t;
  };
}
function yo(t) {
  return function() {
    var e = t.apply(this, arguments);
    this.textContent = e ?? "";
  };
}
function vo(t) {
  return arguments.length ? this.each(t == null ? go : (typeof t == "function" ? yo : mo)(t)) : this.node().textContent;
}
function _o() {
  this.innerHTML = "";
}
function wo(t) {
  return function() {
    this.innerHTML = t;
  };
}
function xo(t) {
  return function() {
    var e = t.apply(this, arguments);
    this.innerHTML = e ?? "";
  };
}
function bo(t) {
  return arguments.length ? this.each(t == null ? _o : (typeof t == "function" ? xo : wo)(t)) : this.node().innerHTML;
}
function ko() {
  this.nextSibling && this.parentNode.appendChild(this);
}
function To() {
  return this.each(ko);
}
function Co() {
  this.previousSibling && this.parentNode.insertBefore(this, this.parentNode.firstChild);
}
function Mo() {
  return this.each(Co);
}
function So(t) {
  var e = typeof t == "function" ? t : ur(t);
  return this.select(function() {
    return this.appendChild(e.apply(this, arguments));
  });
}
function Eo() {
  return null;
}
function Do(t, e) {
  var n = typeof t == "function" ? t : ur(t), r = e == null ? Eo : typeof e == "function" ? e : un(e);
  return this.select(function() {
    return this.insertBefore(n.apply(this, arguments), r.apply(this, arguments) || null);
  });
}
function Ao() {
  var t = this.parentNode;
  t && t.removeChild(this);
}
function No() {
  return this.each(Ao);
}
function Ro() {
  var t = this.cloneNode(!1), e = this.parentNode;
  return e ? e.insertBefore(t, this.nextSibling) : t;
}
function Uo() {
  var t = this.cloneNode(!0), e = this.parentNode;
  return e ? e.insertBefore(t, this.nextSibling) : t;
}
function Fo(t) {
  return this.select(t ? Uo : Ro);
}
function Lo(t) {
  return arguments.length ? this.property("__data__", t) : this.node().__data__;
}
function Io(t) {
  return function(e) {
    t.call(this, e, this.__data__);
  };
}
function zo(t) {
  return t.trim().split(/^|\s+/).map(function(e) {
    var n = "", r = e.indexOf(".");
    return r >= 0 && (n = e.slice(r + 1), e = e.slice(0, r)), { type: e, name: n };
  });
}
function Oo(t) {
  return function() {
    var e = this.__on;
    if (e) {
      for (var n = 0, r = -1, i = e.length, a; n < i; ++n)
        a = e[n], (!t.type || a.type === t.type) && a.name === t.name ? this.removeEventListener(a.type, a.listener, a.options) : e[++r] = a;
      ++r ? e.length = r : delete this.__on;
    }
  };
}
function $o(t, e, n) {
  return function() {
    var r = this.__on, i, a = Io(e);
    if (r) {
      for (var o = 0, u = r.length; o < u; ++o)
        if ((i = r[o]).type === t.type && i.name === t.name) {
          this.removeEventListener(i.type, i.listener, i.options), this.addEventListener(i.type, i.listener = a, i.options = n), i.value = e;
          return;
        }
    }
    this.addEventListener(t.type, a, n), i = { type: t.type, name: t.name, value: e, listener: a, options: n }, r ? r.push(i) : this.__on = [i];
  };
}
function Ho(t, e, n) {
  var r = zo(t + ""), i, a = r.length, o;
  if (arguments.length < 2) {
    var u = this.node().__on;
    if (u) {
      for (var l = 0, s = u.length, c; l < s; ++l)
        for (i = 0, c = u[l]; i < a; ++i)
          if ((o = r[i]).type === c.type && o.name === c.name)
            return c.value;
    }
    return;
  }
  for (u = e ? $o : Oo, i = 0; i < a; ++i) this.each(u(r[i], e, n));
  return this;
}
function vr(t, e, n) {
  var r = dr(t), i = r.CustomEvent;
  typeof i == "function" ? i = new i(e, n) : (i = r.document.createEvent("Event"), n ? (i.initEvent(e, n.bubbles, n.cancelable), i.detail = n.detail) : i.initEvent(e, !1, !1)), t.dispatchEvent(i);
}
function Yo(t, e) {
  return function() {
    return vr(this, t, e);
  };
}
function Po(t, e) {
  return function() {
    return vr(this, t, e.apply(this, arguments));
  };
}
function qo(t, e) {
  return this.each((typeof e == "function" ? Po : Yo)(t, e));
}
function* Wo() {
  for (var t = this._groups, e = 0, n = t.length; e < n; ++e)
    for (var r = t[e], i = 0, a = r.length, o; i < a; ++i)
      (o = r[i]) && (yield o);
}
var _r = [null];
function lt(t, e) {
  this._groups = t, this._parents = e;
}
function le() {
  return new lt([[document.documentElement]], _r);
}
function Vo() {
  return this;
}
lt.prototype = le.prototype = {
  constructor: lt,
  select: mi,
  selectAll: wi,
  selectChild: Ti,
  selectChildren: Ei,
  filter: Di,
  data: Li,
  enter: Ai,
  exit: zi,
  join: Oi,
  merge: $i,
  selection: Vo,
  order: Hi,
  sort: Yi,
  call: qi,
  nodes: Wi,
  node: Vi,
  size: Bi,
  empty: Xi,
  each: Zi,
  attr: eo,
  style: oo,
  property: lo,
  classed: po,
  text: vo,
  html: bo,
  raise: To,
  lower: Mo,
  append: So,
  insert: Do,
  remove: No,
  clone: Fo,
  datum: Lo,
  on: Ho,
  dispatch: qo,
  [Symbol.iterator]: Wo
};
function xt(t) {
  return typeof t == "string" ? new lt([[document.querySelector(t)]], [document.documentElement]) : new lt([[t]], _r);
}
function Bo(t) {
  let e;
  for (; e = t.sourceEvent; ) t = e;
  return t;
}
function Dt(t, e) {
  if (t = Bo(t), e === void 0 && (e = t.currentTarget), e) {
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
const Ke = { capture: !0, passive: !1 };
function Qe(t) {
  t.preventDefault(), t.stopImmediatePropagation();
}
function Xo(t) {
  var e = t.document.documentElement, n = xt(t).on("dragstart.drag", Qe, Ke);
  "onselectstart" in e ? n.on("selectstart.drag", Qe, Ke) : (e.__noselect = e.style.MozUserSelect, e.style.MozUserSelect = "none");
}
function Zo(t, e) {
  var n = t.document.documentElement, r = xt(t).on("dragstart.drag", null);
  e && (r.on("click.drag", Qe, Ke), setTimeout(function() {
    r.on("click.drag", null);
  }, 0)), "onselectstart" in n ? r.on("selectstart.drag", null) : (n.style.MozUserSelect = n.__noselect, delete n.__noselect);
}
function cn(t, e, n) {
  t.prototype = e.prototype = n, n.constructor = t;
}
function wr(t, e) {
  var n = Object.create(t.prototype);
  for (var r in e) n[r] = e[r];
  return n;
}
function ce() {
}
var ae = 0.7, Te = 1 / ae, Pt = "\\s*([+-]?\\d+)\\s*", se = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*", yt = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*", Go = /^#([0-9a-f]{3,8})$/, Ko = new RegExp(`^rgb\\(${Pt},${Pt},${Pt}\\)$`), Qo = new RegExp(`^rgb\\(${yt},${yt},${yt}\\)$`), Jo = new RegExp(`^rgba\\(${Pt},${Pt},${Pt},${se}\\)$`), jo = new RegExp(`^rgba\\(${yt},${yt},${yt},${se}\\)$`), ta = new RegExp(`^hsl\\(${se},${yt},${yt}\\)$`), ea = new RegExp(`^hsla\\(${se},${yt},${yt},${se}\\)$`), Nn = {
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
cn(ce, Rt, {
  copy(t) {
    return Object.assign(new this.constructor(), this, t);
  },
  displayable() {
    return this.rgb().displayable();
  },
  hex: Rn,
  // Deprecated! Use color.formatHex.
  formatHex: Rn,
  formatHex8: na,
  formatHsl: ra,
  formatRgb: Un,
  toString: Un
});
function Rn() {
  return this.rgb().formatHex();
}
function na() {
  return this.rgb().formatHex8();
}
function ra() {
  return xr(this).formatHsl();
}
function Un() {
  return this.rgb().formatRgb();
}
function Rt(t) {
  var e, n;
  return t = (t + "").trim().toLowerCase(), (e = Go.exec(t)) ? (n = e[1].length, e = parseInt(e[1], 16), n === 6 ? Fn(e) : n === 3 ? new ut(e >> 8 & 15 | e >> 4 & 240, e >> 4 & 15 | e & 240, (e & 15) << 4 | e & 15, 1) : n === 8 ? de(e >> 24 & 255, e >> 16 & 255, e >> 8 & 255, (e & 255) / 255) : n === 4 ? de(e >> 12 & 15 | e >> 8 & 240, e >> 8 & 15 | e >> 4 & 240, e >> 4 & 15 | e & 240, ((e & 15) << 4 | e & 15) / 255) : null) : (e = Ko.exec(t)) ? new ut(e[1], e[2], e[3], 1) : (e = Qo.exec(t)) ? new ut(e[1] * 255 / 100, e[2] * 255 / 100, e[3] * 255 / 100, 1) : (e = Jo.exec(t)) ? de(e[1], e[2], e[3], e[4]) : (e = jo.exec(t)) ? de(e[1] * 255 / 100, e[2] * 255 / 100, e[3] * 255 / 100, e[4]) : (e = ta.exec(t)) ? zn(e[1], e[2] / 100, e[3] / 100, 1) : (e = ea.exec(t)) ? zn(e[1], e[2] / 100, e[3] / 100, e[4]) : Nn.hasOwnProperty(t) ? Fn(Nn[t]) : t === "transparent" ? new ut(NaN, NaN, NaN, 0) : null;
}
function Fn(t) {
  return new ut(t >> 16 & 255, t >> 8 & 255, t & 255, 1);
}
function de(t, e, n, r) {
  return r <= 0 && (t = e = n = NaN), new ut(t, e, n, r);
}
function ia(t) {
  return t instanceof ce || (t = Rt(t)), t ? (t = t.rgb(), new ut(t.r, t.g, t.b, t.opacity)) : new ut();
}
function Je(t, e, n, r) {
  return arguments.length === 1 ? ia(t) : new ut(t, e, n, r ?? 1);
}
function ut(t, e, n, r) {
  this.r = +t, this.g = +e, this.b = +n, this.opacity = +r;
}
cn(ut, Je, wr(ce, {
  brighter(t) {
    return t = t == null ? Te : Math.pow(Te, t), new ut(this.r * t, this.g * t, this.b * t, this.opacity);
  },
  darker(t) {
    return t = t == null ? ae : Math.pow(ae, t), new ut(this.r * t, this.g * t, this.b * t, this.opacity);
  },
  rgb() {
    return this;
  },
  clamp() {
    return new ut(Nt(this.r), Nt(this.g), Nt(this.b), Ce(this.opacity));
  },
  displayable() {
    return -0.5 <= this.r && this.r < 255.5 && -0.5 <= this.g && this.g < 255.5 && -0.5 <= this.b && this.b < 255.5 && 0 <= this.opacity && this.opacity <= 1;
  },
  hex: Ln,
  // Deprecated! Use color.formatHex.
  formatHex: Ln,
  formatHex8: oa,
  formatRgb: In,
  toString: In
}));
function Ln() {
  return `#${At(this.r)}${At(this.g)}${At(this.b)}`;
}
function oa() {
  return `#${At(this.r)}${At(this.g)}${At(this.b)}${At((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`;
}
function In() {
  const t = Ce(this.opacity);
  return `${t === 1 ? "rgb(" : "rgba("}${Nt(this.r)}, ${Nt(this.g)}, ${Nt(this.b)}${t === 1 ? ")" : `, ${t})`}`;
}
function Ce(t) {
  return isNaN(t) ? 1 : Math.max(0, Math.min(1, t));
}
function Nt(t) {
  return Math.max(0, Math.min(255, Math.round(t) || 0));
}
function At(t) {
  return t = Nt(t), (t < 16 ? "0" : "") + t.toString(16);
}
function zn(t, e, n, r) {
  return r <= 0 ? t = e = n = NaN : n <= 0 || n >= 1 ? t = e = NaN : e <= 0 && (t = NaN), new ht(t, e, n, r);
}
function xr(t) {
  if (t instanceof ht) return new ht(t.h, t.s, t.l, t.opacity);
  if (t instanceof ce || (t = Rt(t)), !t) return new ht();
  if (t instanceof ht) return t;
  t = t.rgb();
  var e = t.r / 255, n = t.g / 255, r = t.b / 255, i = Math.min(e, n, r), a = Math.max(e, n, r), o = NaN, u = a - i, l = (a + i) / 2;
  return u ? (e === a ? o = (n - r) / u + (n < r) * 6 : n === a ? o = (r - e) / u + 2 : o = (e - n) / u + 4, u /= l < 0.5 ? a + i : 2 - a - i, o *= 60) : u = l > 0 && l < 1 ? 0 : o, new ht(o, u, l, t.opacity);
}
function aa(t, e, n, r) {
  return arguments.length === 1 ? xr(t) : new ht(t, e, n, r ?? 1);
}
function ht(t, e, n, r) {
  this.h = +t, this.s = +e, this.l = +n, this.opacity = +r;
}
cn(ht, aa, wr(ce, {
  brighter(t) {
    return t = t == null ? Te : Math.pow(Te, t), new ht(this.h, this.s, this.l * t, this.opacity);
  },
  darker(t) {
    return t = t == null ? ae : Math.pow(ae, t), new ht(this.h, this.s, this.l * t, this.opacity);
  },
  rgb() {
    var t = this.h % 360 + (this.h < 0) * 360, e = isNaN(t) || isNaN(this.s) ? 0 : this.s, n = this.l, r = n + (n < 0.5 ? n : 1 - n) * e, i = 2 * n - r;
    return new ut(
      He(t >= 240 ? t - 240 : t + 120, i, r),
      He(t, i, r),
      He(t < 120 ? t + 240 : t - 120, i, r),
      this.opacity
    );
  },
  clamp() {
    return new ht(On(this.h), pe(this.s), pe(this.l), Ce(this.opacity));
  },
  displayable() {
    return (0 <= this.s && this.s <= 1 || isNaN(this.s)) && 0 <= this.l && this.l <= 1 && 0 <= this.opacity && this.opacity <= 1;
  },
  formatHsl() {
    const t = Ce(this.opacity);
    return `${t === 1 ? "hsl(" : "hsla("}${On(this.h)}, ${pe(this.s) * 100}%, ${pe(this.l) * 100}%${t === 1 ? ")" : `, ${t})`}`;
  }
}));
function On(t) {
  return t = (t || 0) % 360, t < 0 ? t + 360 : t;
}
function pe(t) {
  return Math.max(0, Math.min(1, t || 0));
}
function He(t, e, n) {
  return (t < 60 ? e + (n - e) * t / 60 : t < 180 ? n : t < 240 ? e + (n - e) * (240 - t) / 60 : e) * 255;
}
const fn = (t) => () => t;
function sa(t, e) {
  return function(n) {
    return t + n * e;
  };
}
function ua(t, e, n) {
  return t = Math.pow(t, n), e = Math.pow(e, n) - t, n = 1 / n, function(r) {
    return Math.pow(t + r * e, n);
  };
}
function la(t) {
  return (t = +t) == 1 ? br : function(e, n) {
    return n - e ? ua(e, n, t) : fn(isNaN(e) ? n : e);
  };
}
function br(t, e) {
  var n = e - t;
  return n ? sa(t, n) : fn(isNaN(t) ? e : t);
}
const Me = function t(e) {
  var n = la(e);
  function r(i, a) {
    var o = n((i = Je(i)).r, (a = Je(a)).r), u = n(i.g, a.g), l = n(i.b, a.b), s = br(i.opacity, a.opacity);
    return function(c) {
      return i.r = o(c), i.g = u(c), i.b = l(c), i.opacity = s(c), i + "";
    };
  }
  return r.gamma = t, r;
}(1);
function ca(t, e) {
  e || (e = []);
  var n = t ? Math.min(e.length, t.length) : 0, r = e.slice(), i;
  return function(a) {
    for (i = 0; i < n; ++i) r[i] = t[i] * (1 - a) + e[i] * a;
    return r;
  };
}
function fa(t) {
  return ArrayBuffer.isView(t) && !(t instanceof DataView);
}
function ha(t, e) {
  var n = e ? e.length : 0, r = t ? Math.min(n, t.length) : 0, i = new Array(r), a = new Array(n), o;
  for (o = 0; o < r; ++o) i[o] = hn(t[o], e[o]);
  for (; o < n; ++o) a[o] = e[o];
  return function(u) {
    for (o = 0; o < r; ++o) a[o] = i[o](u);
    return a;
  };
}
function da(t, e) {
  var n = /* @__PURE__ */ new Date();
  return t = +t, e = +e, function(r) {
    return n.setTime(t * (1 - r) + e * r), n;
  };
}
function ft(t, e) {
  return t = +t, e = +e, function(n) {
    return t * (1 - n) + e * n;
  };
}
function pa(t, e) {
  var n = {}, r = {}, i;
  (t === null || typeof t != "object") && (t = {}), (e === null || typeof e != "object") && (e = {});
  for (i in e)
    i in t ? n[i] = hn(t[i], e[i]) : r[i] = e[i];
  return function(a) {
    for (i in n) r[i] = n[i](a);
    return r;
  };
}
var je = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g, Ye = new RegExp(je.source, "g");
function ga(t) {
  return function() {
    return t;
  };
}
function ma(t) {
  return function(e) {
    return t(e) + "";
  };
}
function kr(t, e) {
  var n = je.lastIndex = Ye.lastIndex = 0, r, i, a, o = -1, u = [], l = [];
  for (t = t + "", e = e + ""; (r = je.exec(t)) && (i = Ye.exec(e)); )
    (a = i.index) > n && (a = e.slice(n, a), u[o] ? u[o] += a : u[++o] = a), (r = r[0]) === (i = i[0]) ? u[o] ? u[o] += i : u[++o] = i : (u[++o] = null, l.push({ i: o, x: ft(r, i) })), n = Ye.lastIndex;
  return n < e.length && (a = e.slice(n), u[o] ? u[o] += a : u[++o] = a), u.length < 2 ? l[0] ? ma(l[0].x) : ga(e) : (e = l.length, function(s) {
    for (var c = 0, m; c < e; ++c) u[(m = l[c]).i] = m.x(s);
    return u.join("");
  });
}
function hn(t, e) {
  var n = typeof e, r;
  return e == null || n === "boolean" ? fn(e) : (n === "number" ? ft : n === "string" ? (r = Rt(e)) ? (e = r, Me) : kr : e instanceof Rt ? Me : e instanceof Date ? da : fa(e) ? ca : Array.isArray(e) ? ha : typeof e.valueOf != "function" && typeof e.toString != "function" || isNaN(e) ? pa : ft)(t, e);
}
function ya(t, e) {
  return t = +t, e = +e, function(n) {
    return Math.round(t * (1 - n) + e * n);
  };
}
var $n = 180 / Math.PI, tn = {
  translateX: 0,
  translateY: 0,
  rotate: 0,
  skewX: 0,
  scaleX: 1,
  scaleY: 1
};
function Tr(t, e, n, r, i, a) {
  var o, u, l;
  return (o = Math.sqrt(t * t + e * e)) && (t /= o, e /= o), (l = t * n + e * r) && (n -= t * l, r -= e * l), (u = Math.sqrt(n * n + r * r)) && (n /= u, r /= u, l /= u), t * r < e * n && (t = -t, e = -e, l = -l, o = -o), {
    translateX: i,
    translateY: a,
    rotate: Math.atan2(e, t) * $n,
    skewX: Math.atan(l) * $n,
    scaleX: o,
    scaleY: u
  };
}
var ge;
function va(t) {
  const e = new (typeof DOMMatrix == "function" ? DOMMatrix : WebKitCSSMatrix)(t + "");
  return e.isIdentity ? tn : Tr(e.a, e.b, e.c, e.d, e.e, e.f);
}
function _a(t) {
  return t == null || (ge || (ge = document.createElementNS("http://www.w3.org/2000/svg", "g")), ge.setAttribute("transform", t), !(t = ge.transform.baseVal.consolidate())) ? tn : (t = t.matrix, Tr(t.a, t.b, t.c, t.d, t.e, t.f));
}
function Cr(t, e, n, r) {
  function i(s) {
    return s.length ? s.pop() + " " : "";
  }
  function a(s, c, m, p, g, z) {
    if (s !== m || c !== p) {
      var q = g.push("translate(", null, e, null, n);
      z.push({ i: q - 4, x: ft(s, m) }, { i: q - 2, x: ft(c, p) });
    } else (m || p) && g.push("translate(" + m + e + p + n);
  }
  function o(s, c, m, p) {
    s !== c ? (s - c > 180 ? c += 360 : c - s > 180 && (s += 360), p.push({ i: m.push(i(m) + "rotate(", null, r) - 2, x: ft(s, c) })) : c && m.push(i(m) + "rotate(" + c + r);
  }
  function u(s, c, m, p) {
    s !== c ? p.push({ i: m.push(i(m) + "skewX(", null, r) - 2, x: ft(s, c) }) : c && m.push(i(m) + "skewX(" + c + r);
  }
  function l(s, c, m, p, g, z) {
    if (s !== m || c !== p) {
      var q = g.push(i(g) + "scale(", null, ",", null, ")");
      z.push({ i: q - 4, x: ft(s, m) }, { i: q - 2, x: ft(c, p) });
    } else (m !== 1 || p !== 1) && g.push(i(g) + "scale(" + m + "," + p + ")");
  }
  return function(s, c) {
    var m = [], p = [];
    return s = t(s), c = t(c), a(s.translateX, s.translateY, c.translateX, c.translateY, m, p), o(s.rotate, c.rotate, m, p), u(s.skewX, c.skewX, m, p), l(s.scaleX, s.scaleY, c.scaleX, c.scaleY, m, p), s = c = null, function(g) {
      for (var z = -1, q = p.length, Z; ++z < q; ) m[(Z = p[z]).i] = Z.x(g);
      return m.join("");
    };
  };
}
var wa = Cr(va, "px, ", "px)", "deg)"), xa = Cr(_a, ", ", ")", ")"), ba = 1e-12;
function Hn(t) {
  return ((t = Math.exp(t)) + 1 / t) / 2;
}
function ka(t) {
  return ((t = Math.exp(t)) - 1 / t) / 2;
}
function Ta(t) {
  return ((t = Math.exp(2 * t)) - 1) / (t + 1);
}
const Ca = function t(e, n, r) {
  function i(a, o) {
    var u = a[0], l = a[1], s = a[2], c = o[0], m = o[1], p = o[2], g = c - u, z = m - l, q = g * g + z * z, Z, N;
    if (q < ba)
      N = Math.log(p / s) / e, Z = function(D) {
        return [
          u + D * g,
          l + D * z,
          s * Math.exp(e * D * N)
        ];
      };
    else {
      var J = Math.sqrt(q), X = (p * p - s * s + r * q) / (2 * s * n * J), F = (p * p - s * s - r * q) / (2 * p * n * J), U = Math.log(Math.sqrt(X * X + 1) - X), b = Math.log(Math.sqrt(F * F + 1) - F);
      N = (b - U) / e, Z = function(D) {
        var f = D * N, h = Hn(U), v = s / (n * J) * (h * Ta(e * f + U) - ka(U));
        return [
          u + v * g,
          l + v * z,
          s * h / Hn(e * f + U)
        ];
      };
    }
    return Z.duration = N * 1e3 * e / Math.SQRT2, Z;
  }
  return i.rho = function(a) {
    var o = Math.max(1e-3, +a), u = o * o, l = u * u;
    return t(o, u, l);
  }, i;
}(Math.SQRT2, 2, 4);
var Wt = 0, re = 0, Qt = 0, Mr = 1e3, Se, ie, Ee = 0, Ut = 0, Fe = 0, ue = typeof performance == "object" && performance.now ? performance : Date, Sr = typeof window == "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(t) {
  setTimeout(t, 17);
};
function dn() {
  return Ut || (Sr(Ma), Ut = ue.now() + Fe);
}
function Ma() {
  Ut = 0;
}
function De() {
  this._call = this._time = this._next = null;
}
De.prototype = Er.prototype = {
  constructor: De,
  restart: function(t, e, n) {
    if (typeof t != "function") throw new TypeError("callback is not a function");
    n = (n == null ? dn() : +n) + (e == null ? 0 : +e), !this._next && ie !== this && (ie ? ie._next = this : Se = this, ie = this), this._call = t, this._time = n, en();
  },
  stop: function() {
    this._call && (this._call = null, this._time = 1 / 0, en());
  }
};
function Er(t, e, n) {
  var r = new De();
  return r.restart(t, e, n), r;
}
function Sa() {
  dn(), ++Wt;
  for (var t = Se, e; t; )
    (e = Ut - t._time) >= 0 && t._call.call(void 0, e), t = t._next;
  --Wt;
}
function Yn() {
  Ut = (Ee = ue.now()) + Fe, Wt = re = 0;
  try {
    Sa();
  } finally {
    Wt = 0, Da(), Ut = 0;
  }
}
function Ea() {
  var t = ue.now(), e = t - Ee;
  e > Mr && (Fe -= e, Ee = t);
}
function Da() {
  for (var t, e = Se, n, r = 1 / 0; e; )
    e._call ? (r > e._time && (r = e._time), t = e, e = e._next) : (n = e._next, e._next = null, e = t ? t._next = n : Se = n);
  ie = t, en(r);
}
function en(t) {
  if (!Wt) {
    re && (re = clearTimeout(re));
    var e = t - Ut;
    e > 24 ? (t < 1 / 0 && (re = setTimeout(Yn, t - ue.now() - Fe)), Qt && (Qt = clearInterval(Qt))) : (Qt || (Ee = ue.now(), Qt = setInterval(Ea, Mr)), Wt = 1, Sr(Yn));
  }
}
function Pn(t, e, n) {
  var r = new De();
  return e = e == null ? 0 : +e, r.restart((i) => {
    r.stop(), t(i + e);
  }, e, n), r;
}
var Aa = sn("start", "end", "cancel", "interrupt"), Na = [], Dr = 0, qn = 1, nn = 2, we = 3, Wn = 4, rn = 5, xe = 6;
function Le(t, e, n, r, i, a) {
  var o = t.__transition;
  if (!o) t.__transition = {};
  else if (n in o) return;
  Ra(t, n, {
    name: e,
    index: r,
    // For context during callback.
    group: i,
    // For context during callback.
    on: Aa,
    tween: Na,
    time: a.time,
    delay: a.delay,
    duration: a.duration,
    ease: a.ease,
    timer: null,
    state: Dr
  });
}
function pn(t, e) {
  var n = dt(t, e);
  if (n.state > Dr) throw new Error("too late; already scheduled");
  return n;
}
function vt(t, e) {
  var n = dt(t, e);
  if (n.state > we) throw new Error("too late; already running");
  return n;
}
function dt(t, e) {
  var n = t.__transition;
  if (!n || !(n = n[e])) throw new Error("transition not found");
  return n;
}
function Ra(t, e, n) {
  var r = t.__transition, i;
  r[e] = n, n.timer = Er(a, 0, n.time);
  function a(s) {
    n.state = qn, n.timer.restart(o, n.delay, n.time), n.delay <= s && o(s - n.delay);
  }
  function o(s) {
    var c, m, p, g;
    if (n.state !== qn) return l();
    for (c in r)
      if (g = r[c], g.name === n.name) {
        if (g.state === we) return Pn(o);
        g.state === Wn ? (g.state = xe, g.timer.stop(), g.on.call("interrupt", t, t.__data__, g.index, g.group), delete r[c]) : +c < e && (g.state = xe, g.timer.stop(), g.on.call("cancel", t, t.__data__, g.index, g.group), delete r[c]);
      }
    if (Pn(function() {
      n.state === we && (n.state = Wn, n.timer.restart(u, n.delay, n.time), u(s));
    }), n.state = nn, n.on.call("start", t, t.__data__, n.index, n.group), n.state === nn) {
      for (n.state = we, i = new Array(p = n.tween.length), c = 0, m = -1; c < p; ++c)
        (g = n.tween[c].value.call(t, t.__data__, n.index, n.group)) && (i[++m] = g);
      i.length = m + 1;
    }
  }
  function u(s) {
    for (var c = s < n.duration ? n.ease.call(null, s / n.duration) : (n.timer.restart(l), n.state = rn, 1), m = -1, p = i.length; ++m < p; )
      i[m].call(t, c);
    n.state === rn && (n.on.call("end", t, t.__data__, n.index, n.group), l());
  }
  function l() {
    n.state = xe, n.timer.stop(), delete r[e];
    for (var s in r) return;
    delete t.__transition;
  }
}
function be(t, e) {
  var n = t.__transition, r, i, a = !0, o;
  if (n) {
    e = e == null ? null : e + "";
    for (o in n) {
      if ((r = n[o]).name !== e) {
        a = !1;
        continue;
      }
      i = r.state > nn && r.state < rn, r.state = xe, r.timer.stop(), r.on.call(i ? "interrupt" : "cancel", t, t.__data__, r.index, r.group), delete n[o];
    }
    a && delete t.__transition;
  }
}
function Ua(t) {
  return this.each(function() {
    be(this, t);
  });
}
function Fa(t, e) {
  var n, r;
  return function() {
    var i = vt(this, t), a = i.tween;
    if (a !== n) {
      r = n = a;
      for (var o = 0, u = r.length; o < u; ++o)
        if (r[o].name === e) {
          r = r.slice(), r.splice(o, 1);
          break;
        }
    }
    i.tween = r;
  };
}
function La(t, e, n) {
  var r, i;
  if (typeof n != "function") throw new Error();
  return function() {
    var a = vt(this, t), o = a.tween;
    if (o !== r) {
      i = (r = o).slice();
      for (var u = { name: e, value: n }, l = 0, s = i.length; l < s; ++l)
        if (i[l].name === e) {
          i[l] = u;
          break;
        }
      l === s && i.push(u);
    }
    a.tween = i;
  };
}
function Ia(t, e) {
  var n = this._id;
  if (t += "", arguments.length < 2) {
    for (var r = dt(this.node(), n).tween, i = 0, a = r.length, o; i < a; ++i)
      if ((o = r[i]).name === t)
        return o.value;
    return null;
  }
  return this.each((e == null ? Fa : La)(n, t, e));
}
function gn(t, e, n) {
  var r = t._id;
  return t.each(function() {
    var i = vt(this, r);
    (i.value || (i.value = {}))[e] = n.apply(this, arguments);
  }), function(i) {
    return dt(i, r).value[e];
  };
}
function Ar(t, e) {
  var n;
  return (typeof e == "number" ? ft : e instanceof Rt ? Me : (n = Rt(e)) ? (e = n, Me) : kr)(t, e);
}
function za(t) {
  return function() {
    this.removeAttribute(t);
  };
}
function Oa(t) {
  return function() {
    this.removeAttributeNS(t.space, t.local);
  };
}
function $a(t, e, n) {
  var r, i = n + "", a;
  return function() {
    var o = this.getAttribute(t);
    return o === i ? null : o === r ? a : a = e(r = o, n);
  };
}
function Ha(t, e, n) {
  var r, i = n + "", a;
  return function() {
    var o = this.getAttributeNS(t.space, t.local);
    return o === i ? null : o === r ? a : a = e(r = o, n);
  };
}
function Ya(t, e, n) {
  var r, i, a;
  return function() {
    var o, u = n(this), l;
    return u == null ? void this.removeAttribute(t) : (o = this.getAttribute(t), l = u + "", o === l ? null : o === r && l === i ? a : (i = l, a = e(r = o, u)));
  };
}
function Pa(t, e, n) {
  var r, i, a;
  return function() {
    var o, u = n(this), l;
    return u == null ? void this.removeAttributeNS(t.space, t.local) : (o = this.getAttributeNS(t.space, t.local), l = u + "", o === l ? null : o === r && l === i ? a : (i = l, a = e(r = o, u)));
  };
}
function qa(t, e) {
  var n = Ue(t), r = n === "transform" ? xa : Ar;
  return this.attrTween(t, typeof e == "function" ? (n.local ? Pa : Ya)(n, r, gn(this, "attr." + t, e)) : e == null ? (n.local ? Oa : za)(n) : (n.local ? Ha : $a)(n, r, e));
}
function Wa(t, e) {
  return function(n) {
    this.setAttribute(t, e.call(this, n));
  };
}
function Va(t, e) {
  return function(n) {
    this.setAttributeNS(t.space, t.local, e.call(this, n));
  };
}
function Ba(t, e) {
  var n, r;
  function i() {
    var a = e.apply(this, arguments);
    return a !== r && (n = (r = a) && Va(t, a)), n;
  }
  return i._value = e, i;
}
function Xa(t, e) {
  var n, r;
  function i() {
    var a = e.apply(this, arguments);
    return a !== r && (n = (r = a) && Wa(t, a)), n;
  }
  return i._value = e, i;
}
function Za(t, e) {
  var n = "attr." + t;
  if (arguments.length < 2) return (n = this.tween(n)) && n._value;
  if (e == null) return this.tween(n, null);
  if (typeof e != "function") throw new Error();
  var r = Ue(t);
  return this.tween(n, (r.local ? Ba : Xa)(r, e));
}
function Ga(t, e) {
  return function() {
    pn(this, t).delay = +e.apply(this, arguments);
  };
}
function Ka(t, e) {
  return e = +e, function() {
    pn(this, t).delay = e;
  };
}
function Qa(t) {
  var e = this._id;
  return arguments.length ? this.each((typeof t == "function" ? Ga : Ka)(e, t)) : dt(this.node(), e).delay;
}
function Ja(t, e) {
  return function() {
    vt(this, t).duration = +e.apply(this, arguments);
  };
}
function ja(t, e) {
  return e = +e, function() {
    vt(this, t).duration = e;
  };
}
function ts(t) {
  var e = this._id;
  return arguments.length ? this.each((typeof t == "function" ? Ja : ja)(e, t)) : dt(this.node(), e).duration;
}
function es(t, e) {
  if (typeof e != "function") throw new Error();
  return function() {
    vt(this, t).ease = e;
  };
}
function ns(t) {
  var e = this._id;
  return arguments.length ? this.each(es(e, t)) : dt(this.node(), e).ease;
}
function rs(t, e) {
  return function() {
    var n = e.apply(this, arguments);
    if (typeof n != "function") throw new Error();
    vt(this, t).ease = n;
  };
}
function is(t) {
  if (typeof t != "function") throw new Error();
  return this.each(rs(this._id, t));
}
function os(t) {
  typeof t != "function" && (t = cr(t));
  for (var e = this._groups, n = e.length, r = new Array(n), i = 0; i < n; ++i)
    for (var a = e[i], o = a.length, u = r[i] = [], l, s = 0; s < o; ++s)
      (l = a[s]) && t.call(l, l.__data__, s, a) && u.push(l);
  return new Ct(r, this._parents, this._name, this._id);
}
function as(t) {
  if (t._id !== this._id) throw new Error();
  for (var e = this._groups, n = t._groups, r = e.length, i = n.length, a = Math.min(r, i), o = new Array(r), u = 0; u < a; ++u)
    for (var l = e[u], s = n[u], c = l.length, m = o[u] = new Array(c), p, g = 0; g < c; ++g)
      (p = l[g] || s[g]) && (m[g] = p);
  for (; u < r; ++u)
    o[u] = e[u];
  return new Ct(o, this._parents, this._name, this._id);
}
function ss(t) {
  return (t + "").trim().split(/^|\s+/).every(function(e) {
    var n = e.indexOf(".");
    return n >= 0 && (e = e.slice(0, n)), !e || e === "start";
  });
}
function us(t, e, n) {
  var r, i, a = ss(e) ? pn : vt;
  return function() {
    var o = a(this, t), u = o.on;
    u !== r && (i = (r = u).copy()).on(e, n), o.on = i;
  };
}
function ls(t, e) {
  var n = this._id;
  return arguments.length < 2 ? dt(this.node(), n).on.on(t) : this.each(us(n, t, e));
}
function cs(t) {
  return function() {
    var e = this.parentNode;
    for (var n in this.__transition) if (+n !== t) return;
    e && e.removeChild(this);
  };
}
function fs() {
  return this.on("end.remove", cs(this._id));
}
function hs(t) {
  var e = this._name, n = this._id;
  typeof t != "function" && (t = un(t));
  for (var r = this._groups, i = r.length, a = new Array(i), o = 0; o < i; ++o)
    for (var u = r[o], l = u.length, s = a[o] = new Array(l), c, m, p = 0; p < l; ++p)
      (c = u[p]) && (m = t.call(c, c.__data__, p, u)) && ("__data__" in c && (m.__data__ = c.__data__), s[p] = m, Le(s[p], e, n, p, s, dt(c, n)));
  return new Ct(a, this._parents, e, n);
}
function ds(t) {
  var e = this._name, n = this._id;
  typeof t != "function" && (t = lr(t));
  for (var r = this._groups, i = r.length, a = [], o = [], u = 0; u < i; ++u)
    for (var l = r[u], s = l.length, c, m = 0; m < s; ++m)
      if (c = l[m]) {
        for (var p = t.call(c, c.__data__, m, l), g, z = dt(c, n), q = 0, Z = p.length; q < Z; ++q)
          (g = p[q]) && Le(g, e, n, q, p, z);
        a.push(p), o.push(c);
      }
  return new Ct(a, o, e, n);
}
var ps = le.prototype.constructor;
function gs() {
  return new ps(this._groups, this._parents);
}
function ms(t, e) {
  var n, r, i;
  return function() {
    var a = qt(this, t), o = (this.style.removeProperty(t), qt(this, t));
    return a === o ? null : a === n && o === r ? i : i = e(n = a, r = o);
  };
}
function Nr(t) {
  return function() {
    this.style.removeProperty(t);
  };
}
function ys(t, e, n) {
  var r, i = n + "", a;
  return function() {
    var o = qt(this, t);
    return o === i ? null : o === r ? a : a = e(r = o, n);
  };
}
function vs(t, e, n) {
  var r, i, a;
  return function() {
    var o = qt(this, t), u = n(this), l = u + "";
    return u == null && (l = u = (this.style.removeProperty(t), qt(this, t))), o === l ? null : o === r && l === i ? a : (i = l, a = e(r = o, u));
  };
}
function _s(t, e) {
  var n, r, i, a = "style." + e, o = "end." + a, u;
  return function() {
    var l = vt(this, t), s = l.on, c = l.value[a] == null ? u || (u = Nr(e)) : void 0;
    (s !== n || i !== c) && (r = (n = s).copy()).on(o, i = c), l.on = r;
  };
}
function ws(t, e, n) {
  var r = (t += "") == "transform" ? wa : Ar;
  return e == null ? this.styleTween(t, ms(t, r)).on("end.style." + t, Nr(t)) : typeof e == "function" ? this.styleTween(t, vs(t, r, gn(this, "style." + t, e))).each(_s(this._id, t)) : this.styleTween(t, ys(t, r, e), n).on("end.style." + t, null);
}
function xs(t, e, n) {
  return function(r) {
    this.style.setProperty(t, e.call(this, r), n);
  };
}
function bs(t, e, n) {
  var r, i;
  function a() {
    var o = e.apply(this, arguments);
    return o !== i && (r = (i = o) && xs(t, o, n)), r;
  }
  return a._value = e, a;
}
function ks(t, e, n) {
  var r = "style." + (t += "");
  if (arguments.length < 2) return (r = this.tween(r)) && r._value;
  if (e == null) return this.tween(r, null);
  if (typeof e != "function") throw new Error();
  return this.tween(r, bs(t, e, n ?? ""));
}
function Ts(t) {
  return function() {
    this.textContent = t;
  };
}
function Cs(t) {
  return function() {
    var e = t(this);
    this.textContent = e ?? "";
  };
}
function Ms(t) {
  return this.tween("text", typeof t == "function" ? Cs(gn(this, "text", t)) : Ts(t == null ? "" : t + ""));
}
function Ss(t) {
  return function(e) {
    this.textContent = t.call(this, e);
  };
}
function Es(t) {
  var e, n;
  function r() {
    var i = t.apply(this, arguments);
    return i !== n && (e = (n = i) && Ss(i)), e;
  }
  return r._value = t, r;
}
function Ds(t) {
  var e = "text";
  if (arguments.length < 1) return (e = this.tween(e)) && e._value;
  if (t == null) return this.tween(e, null);
  if (typeof t != "function") throw new Error();
  return this.tween(e, Es(t));
}
function As() {
  for (var t = this._name, e = this._id, n = Rr(), r = this._groups, i = r.length, a = 0; a < i; ++a)
    for (var o = r[a], u = o.length, l, s = 0; s < u; ++s)
      if (l = o[s]) {
        var c = dt(l, e);
        Le(l, t, n, s, o, {
          time: c.time + c.delay + c.duration,
          delay: 0,
          duration: c.duration,
          ease: c.ease
        });
      }
  return new Ct(r, this._parents, t, n);
}
function Ns() {
  var t, e, n = this, r = n._id, i = n.size();
  return new Promise(function(a, o) {
    var u = { value: o }, l = { value: function() {
      --i === 0 && a();
    } };
    n.each(function() {
      var s = vt(this, r), c = s.on;
      c !== t && (e = (t = c).copy(), e._.cancel.push(u), e._.interrupt.push(u), e._.end.push(l)), s.on = e;
    }), i === 0 && a();
  });
}
var Rs = 0;
function Ct(t, e, n, r) {
  this._groups = t, this._parents = e, this._name = n, this._id = r;
}
function Rr() {
  return ++Rs;
}
var wt = le.prototype;
Ct.prototype = {
  constructor: Ct,
  select: hs,
  selectAll: ds,
  selectChild: wt.selectChild,
  selectChildren: wt.selectChildren,
  filter: os,
  merge: as,
  selection: gs,
  transition: As,
  call: wt.call,
  nodes: wt.nodes,
  node: wt.node,
  size: wt.size,
  empty: wt.empty,
  each: wt.each,
  on: ls,
  attr: qa,
  attrTween: Za,
  style: ws,
  styleTween: ks,
  text: Ms,
  textTween: Ds,
  remove: fs,
  tween: Ia,
  delay: Qa,
  duration: ts,
  ease: ns,
  easeVarying: is,
  end: Ns,
  [Symbol.iterator]: wt[Symbol.iterator]
};
function Us(t) {
  return ((t *= 2) <= 1 ? t * t * t : (t -= 2) * t * t + 2) / 2;
}
var Fs = {
  time: null,
  // Set on use.
  delay: 0,
  duration: 250,
  ease: Us
};
function Ls(t, e) {
  for (var n; !(n = t.__transition) || !(n = n[e]); )
    if (!(t = t.parentNode))
      throw new Error(`transition ${e} not found`);
  return n;
}
function Is(t) {
  var e, n;
  t instanceof Ct ? (e = t._id, t = t._name) : (e = Rr(), (n = Fs).time = dn(), t = t == null ? null : t + "");
  for (var r = this._groups, i = r.length, a = 0; a < i; ++a)
    for (var o = r[a], u = o.length, l, s = 0; s < u; ++s)
      (l = o[s]) && Le(l, t, e, s, o, n || Ls(l, e));
  return new Ct(r, this._parents, t, e);
}
le.prototype.interrupt = Ua;
le.prototype.transition = Is;
function zs(t, e) {
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
function Os(t) {
  return function() {
    return t;
  };
}
function $s(t) {
  return +t;
}
var Vn = [0, 1];
function Ht(t) {
  return t;
}
function on(t, e) {
  return (e -= t = +t) ? function(n) {
    return (n - t) / e;
  } : Os(isNaN(e) ? NaN : 0.5);
}
function Hs(t, e) {
  var n;
  return t > e && (n = t, t = e, e = n), function(r) {
    return Math.max(t, Math.min(e, r));
  };
}
function Ys(t, e, n) {
  var r = t[0], i = t[1], a = e[0], o = e[1];
  return i < r ? (r = on(i, r), a = n(o, a)) : (r = on(r, i), a = n(a, o)), function(u) {
    return a(r(u));
  };
}
function Ps(t, e, n) {
  var r = Math.min(t.length, e.length) - 1, i = new Array(r), a = new Array(r), o = -1;
  for (t[r] < t[0] && (t = t.slice().reverse(), e = e.slice().reverse()); ++o < r; )
    i[o] = on(t[o], t[o + 1]), a[o] = n(e[o], e[o + 1]);
  return function(u) {
    var l = ti(t, u, 1, r) - 1;
    return a[l](i[l](u));
  };
}
function qs(t, e) {
  return e.domain(t.domain()).range(t.range()).interpolate(t.interpolate()).clamp(t.clamp()).unknown(t.unknown());
}
function Ws() {
  var t = Vn, e = Vn, n = hn, r, i, a, o = Ht, u, l, s;
  function c() {
    var p = Math.min(t.length, e.length);
    return o !== Ht && (o = Hs(t[0], t[p - 1])), u = p > 2 ? Ps : Ys, l = s = null, m;
  }
  function m(p) {
    return p == null || isNaN(p = +p) ? a : (l || (l = u(t.map(r), e, n)))(r(o(p)));
  }
  return m.invert = function(p) {
    return o(i((s || (s = u(e, t.map(r), ft)))(p)));
  }, m.domain = function(p) {
    return arguments.length ? (t = Array.from(p, $s), c()) : t.slice();
  }, m.range = function(p) {
    return arguments.length ? (e = Array.from(p), c()) : e.slice();
  }, m.rangeRound = function(p) {
    return e = Array.from(p), n = ya, c();
  }, m.clamp = function(p) {
    return arguments.length ? (o = p ? !0 : Ht, c()) : o !== Ht;
  }, m.interpolate = function(p) {
    return arguments.length ? (n = p, c()) : n;
  }, m.unknown = function(p) {
    return arguments.length ? (a = p, m) : a;
  }, function(p, g) {
    return r = p, i = g, c();
  };
}
function Vs() {
  return Ws()(Ht, Ht);
}
function Bs(t, e) {
  t = t.slice();
  var n = 0, r = t.length - 1, i = t[n], a = t[r], o;
  return a < i && (o = n, n = r, r = o, o = i, i = a, a = o), t[n] = e.floor(i), t[r] = e.ceil(a), t;
}
const Pe = /* @__PURE__ */ new Date(), qe = /* @__PURE__ */ new Date();
function rt(t, e, n, r) {
  function i(a) {
    return t(a = arguments.length === 0 ? /* @__PURE__ */ new Date() : /* @__PURE__ */ new Date(+a)), a;
  }
  return i.floor = (a) => (t(a = /* @__PURE__ */ new Date(+a)), a), i.ceil = (a) => (t(a = new Date(a - 1)), e(a, 1), t(a), a), i.round = (a) => {
    const o = i(a), u = i.ceil(a);
    return a - o < u - a ? o : u;
  }, i.offset = (a, o) => (e(a = /* @__PURE__ */ new Date(+a), o == null ? 1 : Math.floor(o)), a), i.range = (a, o, u) => {
    const l = [];
    if (a = i.ceil(a), u = u == null ? 1 : Math.floor(u), !(a < o) || !(u > 0)) return l;
    let s;
    do
      l.push(s = /* @__PURE__ */ new Date(+a)), e(a, u), t(a);
    while (s < a && a < o);
    return l;
  }, i.filter = (a) => rt((o) => {
    if (o >= o) for (; t(o), !a(o); ) o.setTime(o - 1);
  }, (o, u) => {
    if (o >= o)
      if (u < 0) for (; ++u <= 0; )
        for (; e(o, -1), !a(o); )
          ;
      else for (; --u >= 0; )
        for (; e(o, 1), !a(o); )
          ;
  }), n && (i.count = (a, o) => (Pe.setTime(+a), qe.setTime(+o), t(Pe), t(qe), Math.floor(n(Pe, qe))), i.every = (a) => (a = Math.floor(a), !isFinite(a) || !(a > 0) ? null : a > 1 ? i.filter(r ? (o) => r(o) % a === 0 : (o) => i.count(0, o) % a === 0) : i)), i;
}
const Ae = rt(() => {
}, (t, e) => {
  t.setTime(+t + e);
}, (t, e) => e - t);
Ae.every = (t) => (t = Math.floor(t), !isFinite(t) || !(t > 0) ? null : t > 1 ? rt((e) => {
  e.setTime(Math.floor(e / t) * t);
}, (e, n) => {
  e.setTime(+e + n * t);
}, (e, n) => (n - e) / t) : Ae);
Ae.range;
const bt = 1e3, ct = bt * 60, kt = ct * 60, Mt = kt * 24, mn = Mt * 7, Bn = Mt * 30, We = Mt * 365, Yt = rt((t) => {
  t.setTime(t - t.getMilliseconds());
}, (t, e) => {
  t.setTime(+t + e * bt);
}, (t, e) => (e - t) / bt, (t) => t.getUTCSeconds());
Yt.range;
const yn = rt((t) => {
  t.setTime(t - t.getMilliseconds() - t.getSeconds() * bt);
}, (t, e) => {
  t.setTime(+t + e * ct);
}, (t, e) => (e - t) / ct, (t) => t.getMinutes());
yn.range;
const Xs = rt((t) => {
  t.setUTCSeconds(0, 0);
}, (t, e) => {
  t.setTime(+t + e * ct);
}, (t, e) => (e - t) / ct, (t) => t.getUTCMinutes());
Xs.range;
const vn = rt((t) => {
  t.setTime(t - t.getMilliseconds() - t.getSeconds() * bt - t.getMinutes() * ct);
}, (t, e) => {
  t.setTime(+t + e * kt);
}, (t, e) => (e - t) / kt, (t) => t.getHours());
vn.range;
const Zs = rt((t) => {
  t.setUTCMinutes(0, 0, 0);
}, (t, e) => {
  t.setTime(+t + e * kt);
}, (t, e) => (e - t) / kt, (t) => t.getUTCHours());
Zs.range;
const fe = rt(
  (t) => t.setHours(0, 0, 0, 0),
  (t, e) => t.setDate(t.getDate() + e),
  (t, e) => (e - t - (e.getTimezoneOffset() - t.getTimezoneOffset()) * ct) / Mt,
  (t) => t.getDate() - 1
);
fe.range;
const _n = rt((t) => {
  t.setUTCHours(0, 0, 0, 0);
}, (t, e) => {
  t.setUTCDate(t.getUTCDate() + e);
}, (t, e) => (e - t) / Mt, (t) => t.getUTCDate() - 1);
_n.range;
const Gs = rt((t) => {
  t.setUTCHours(0, 0, 0, 0);
}, (t, e) => {
  t.setUTCDate(t.getUTCDate() + e);
}, (t, e) => (e - t) / Mt, (t) => Math.floor(t / Mt));
Gs.range;
function Lt(t) {
  return rt((e) => {
    e.setDate(e.getDate() - (e.getDay() + 7 - t) % 7), e.setHours(0, 0, 0, 0);
  }, (e, n) => {
    e.setDate(e.getDate() + n * 7);
  }, (e, n) => (n - e - (n.getTimezoneOffset() - e.getTimezoneOffset()) * ct) / mn);
}
const Ie = Lt(0), Ne = Lt(1), Ks = Lt(2), Qs = Lt(3), Vt = Lt(4), Js = Lt(5), js = Lt(6);
Ie.range;
Ne.range;
Ks.range;
Qs.range;
Vt.range;
Js.range;
js.range;
function It(t) {
  return rt((e) => {
    e.setUTCDate(e.getUTCDate() - (e.getUTCDay() + 7 - t) % 7), e.setUTCHours(0, 0, 0, 0);
  }, (e, n) => {
    e.setUTCDate(e.getUTCDate() + n * 7);
  }, (e, n) => (n - e) / mn);
}
const Ur = It(0), Re = It(1), tu = It(2), eu = It(3), Bt = It(4), nu = It(5), ru = It(6);
Ur.range;
Re.range;
tu.range;
eu.range;
Bt.range;
nu.range;
ru.range;
const wn = rt((t) => {
  t.setDate(1), t.setHours(0, 0, 0, 0);
}, (t, e) => {
  t.setMonth(t.getMonth() + e);
}, (t, e) => e.getMonth() - t.getMonth() + (e.getFullYear() - t.getFullYear()) * 12, (t) => t.getMonth());
wn.range;
const iu = rt((t) => {
  t.setUTCDate(1), t.setUTCHours(0, 0, 0, 0);
}, (t, e) => {
  t.setUTCMonth(t.getUTCMonth() + e);
}, (t, e) => e.getUTCMonth() - t.getUTCMonth() + (e.getUTCFullYear() - t.getUTCFullYear()) * 12, (t) => t.getUTCMonth());
iu.range;
const St = rt((t) => {
  t.setMonth(0, 1), t.setHours(0, 0, 0, 0);
}, (t, e) => {
  t.setFullYear(t.getFullYear() + e);
}, (t, e) => e.getFullYear() - t.getFullYear(), (t) => t.getFullYear());
St.every = (t) => !isFinite(t = Math.floor(t)) || !(t > 0) ? null : rt((e) => {
  e.setFullYear(Math.floor(e.getFullYear() / t) * t), e.setMonth(0, 1), e.setHours(0, 0, 0, 0);
}, (e, n) => {
  e.setFullYear(e.getFullYear() + n * t);
});
St.range;
const Ft = rt((t) => {
  t.setUTCMonth(0, 1), t.setUTCHours(0, 0, 0, 0);
}, (t, e) => {
  t.setUTCFullYear(t.getUTCFullYear() + e);
}, (t, e) => e.getUTCFullYear() - t.getUTCFullYear(), (t) => t.getUTCFullYear());
Ft.every = (t) => !isFinite(t = Math.floor(t)) || !(t > 0) ? null : rt((e) => {
  e.setUTCFullYear(Math.floor(e.getUTCFullYear() / t) * t), e.setUTCMonth(0, 1), e.setUTCHours(0, 0, 0, 0);
}, (e, n) => {
  e.setUTCFullYear(e.getUTCFullYear() + n * t);
});
Ft.range;
function ou(t, e, n, r, i, a) {
  const o = [
    [Yt, 1, bt],
    [Yt, 5, 5 * bt],
    [Yt, 15, 15 * bt],
    [Yt, 30, 30 * bt],
    [a, 1, ct],
    [a, 5, 5 * ct],
    [a, 15, 15 * ct],
    [a, 30, 30 * ct],
    [i, 1, kt],
    [i, 3, 3 * kt],
    [i, 6, 6 * kt],
    [i, 12, 12 * kt],
    [r, 1, Mt],
    [r, 2, 2 * Mt],
    [n, 1, mn],
    [e, 1, Bn],
    [e, 3, 3 * Bn],
    [t, 1, We]
  ];
  function u(s, c, m) {
    const p = c < s;
    p && ([s, c] = [c, s]);
    const g = m && typeof m.range == "function" ? m : l(s, c, m), z = g ? g.range(s, +c + 1) : [];
    return p ? z.reverse() : z;
  }
  function l(s, c, m) {
    const p = Math.abs(c - s) / m, g = an(([, , Z]) => Z).right(o, p);
    if (g === o.length) return t.every(Cn(s / We, c / We, m));
    if (g === 0) return Ae.every(Math.max(Cn(s, c, m), 1));
    const [z, q] = o[p / o[g - 1][2] < o[g][2] / p ? g - 1 : g];
    return z.every(q);
  }
  return [u, l];
}
const [au, su] = ou(St, wn, Ie, fe, vn, yn);
function Ve(t) {
  if (0 <= t.y && t.y < 100) {
    var e = new Date(-1, t.m, t.d, t.H, t.M, t.S, t.L);
    return e.setFullYear(t.y), e;
  }
  return new Date(t.y, t.m, t.d, t.H, t.M, t.S, t.L);
}
function Be(t) {
  if (0 <= t.y && t.y < 100) {
    var e = new Date(Date.UTC(-1, t.m, t.d, t.H, t.M, t.S, t.L));
    return e.setUTCFullYear(t.y), e;
  }
  return new Date(Date.UTC(t.y, t.m, t.d, t.H, t.M, t.S, t.L));
}
function Jt(t, e, n) {
  return { y: t, m: e, d: n, H: 0, M: 0, S: 0, L: 0 };
}
function uu(t) {
  var e = t.dateTime, n = t.date, r = t.time, i = t.periods, a = t.days, o = t.shortDays, u = t.months, l = t.shortMonths, s = jt(i), c = te(i), m = jt(a), p = te(a), g = jt(o), z = te(o), q = jt(u), Z = te(u), N = jt(l), J = te(l), X = {
    a: x,
    A: R,
    b: k,
    B: O,
    c: null,
    d: Jn,
    e: Jn,
    f: Nu,
    g: Yu,
    G: qu,
    H: Eu,
    I: Du,
    j: Au,
    L: Fr,
    m: Ru,
    M: Uu,
    p: E,
    q: L,
    Q: er,
    s: nr,
    S: Fu,
    u: Lu,
    U: Iu,
    V: zu,
    w: Ou,
    W: $u,
    x: null,
    X: null,
    y: Hu,
    Y: Pu,
    Z: Wu,
    "%": tr
  }, F = {
    a: A,
    A: B,
    b: G,
    B: j,
    c: null,
    d: jn,
    e: jn,
    f: Zu,
    g: il,
    G: al,
    H: Vu,
    I: Bu,
    j: Xu,
    L: Ir,
    m: Gu,
    M: Ku,
    p: tt,
    q: Y,
    Q: er,
    s: nr,
    S: Qu,
    u: Ju,
    U: ju,
    V: tl,
    w: el,
    W: nl,
    x: null,
    X: null,
    y: rl,
    Y: ol,
    Z: sl,
    "%": tr
  }, U = {
    a: v,
    A: S,
    b: C,
    B: P,
    c: d,
    d: Kn,
    e: Kn,
    f: Tu,
    g: Gn,
    G: Zn,
    H: Qn,
    I: Qn,
    j: wu,
    L: ku,
    m: _u,
    M: xu,
    p: h,
    q: vu,
    Q: Mu,
    s: Su,
    S: bu,
    u: du,
    U: pu,
    V: gu,
    w: hu,
    W: mu,
    x: M,
    X: _,
    y: Gn,
    Y: Zn,
    Z: yu,
    "%": Cu
  };
  X.x = b(n, X), X.X = b(r, X), X.c = b(e, X), F.x = b(n, F), F.X = b(r, F), F.c = b(e, F);
  function b(w, I) {
    return function(T) {
      var y = [], K = -1, $ = 0, V = w.length, H, nt, W;
      for (T instanceof Date || (T = /* @__PURE__ */ new Date(+T)); ++K < V; )
        w.charCodeAt(K) === 37 && (y.push(w.slice($, K)), (nt = Xn[H = w.charAt(++K)]) != null ? H = w.charAt(++K) : nt = H === "e" ? " " : "0", (W = I[H]) && (H = W(T, nt)), y.push(H), $ = K + 1);
      return y.push(w.slice($, K)), y.join("");
    };
  }
  function D(w, I) {
    return function(T) {
      var y = Jt(1900, void 0, 1), K = f(y, w, T += "", 0), $, V;
      if (K != T.length) return null;
      if ("Q" in y) return new Date(y.Q);
      if ("s" in y) return new Date(y.s * 1e3 + ("L" in y ? y.L : 0));
      if (I && !("Z" in y) && (y.Z = 0), "p" in y && (y.H = y.H % 12 + y.p * 12), y.m === void 0 && (y.m = "q" in y ? y.q : 0), "V" in y) {
        if (y.V < 1 || y.V > 53) return null;
        "w" in y || (y.w = 1), "Z" in y ? ($ = Be(Jt(y.y, 0, 1)), V = $.getUTCDay(), $ = V > 4 || V === 0 ? Re.ceil($) : Re($), $ = _n.offset($, (y.V - 1) * 7), y.y = $.getUTCFullYear(), y.m = $.getUTCMonth(), y.d = $.getUTCDate() + (y.w + 6) % 7) : ($ = Ve(Jt(y.y, 0, 1)), V = $.getDay(), $ = V > 4 || V === 0 ? Ne.ceil($) : Ne($), $ = fe.offset($, (y.V - 1) * 7), y.y = $.getFullYear(), y.m = $.getMonth(), y.d = $.getDate() + (y.w + 6) % 7);
      } else ("W" in y || "U" in y) && ("w" in y || (y.w = "u" in y ? y.u % 7 : "W" in y ? 1 : 0), V = "Z" in y ? Be(Jt(y.y, 0, 1)).getUTCDay() : Ve(Jt(y.y, 0, 1)).getDay(), y.m = 0, y.d = "W" in y ? (y.w + 6) % 7 + y.W * 7 - (V + 5) % 7 : y.w + y.U * 7 - (V + 6) % 7);
      return "Z" in y ? (y.H += y.Z / 100 | 0, y.M += y.Z % 100, Be(y)) : Ve(y);
    };
  }
  function f(w, I, T, y) {
    for (var K = 0, $ = I.length, V = T.length, H, nt; K < $; ) {
      if (y >= V) return -1;
      if (H = I.charCodeAt(K++), H === 37) {
        if (H = I.charAt(K++), nt = U[H in Xn ? I.charAt(K++) : H], !nt || (y = nt(w, T, y)) < 0) return -1;
      } else if (H != T.charCodeAt(y++))
        return -1;
    }
    return y;
  }
  function h(w, I, T) {
    var y = s.exec(I.slice(T));
    return y ? (w.p = c.get(y[0].toLowerCase()), T + y[0].length) : -1;
  }
  function v(w, I, T) {
    var y = g.exec(I.slice(T));
    return y ? (w.w = z.get(y[0].toLowerCase()), T + y[0].length) : -1;
  }
  function S(w, I, T) {
    var y = m.exec(I.slice(T));
    return y ? (w.w = p.get(y[0].toLowerCase()), T + y[0].length) : -1;
  }
  function C(w, I, T) {
    var y = N.exec(I.slice(T));
    return y ? (w.m = J.get(y[0].toLowerCase()), T + y[0].length) : -1;
  }
  function P(w, I, T) {
    var y = q.exec(I.slice(T));
    return y ? (w.m = Z.get(y[0].toLowerCase()), T + y[0].length) : -1;
  }
  function d(w, I, T) {
    return f(w, e, I, T);
  }
  function M(w, I, T) {
    return f(w, n, I, T);
  }
  function _(w, I, T) {
    return f(w, r, I, T);
  }
  function x(w) {
    return o[w.getDay()];
  }
  function R(w) {
    return a[w.getDay()];
  }
  function k(w) {
    return l[w.getMonth()];
  }
  function O(w) {
    return u[w.getMonth()];
  }
  function E(w) {
    return i[+(w.getHours() >= 12)];
  }
  function L(w) {
    return 1 + ~~(w.getMonth() / 3);
  }
  function A(w) {
    return o[w.getUTCDay()];
  }
  function B(w) {
    return a[w.getUTCDay()];
  }
  function G(w) {
    return l[w.getUTCMonth()];
  }
  function j(w) {
    return u[w.getUTCMonth()];
  }
  function tt(w) {
    return i[+(w.getUTCHours() >= 12)];
  }
  function Y(w) {
    return 1 + ~~(w.getUTCMonth() / 3);
  }
  return {
    format: function(w) {
      var I = b(w += "", X);
      return I.toString = function() {
        return w;
      }, I;
    },
    parse: function(w) {
      var I = D(w += "", !1);
      return I.toString = function() {
        return w;
      }, I;
    },
    utcFormat: function(w) {
      var I = b(w += "", F);
      return I.toString = function() {
        return w;
      }, I;
    },
    utcParse: function(w) {
      var I = D(w += "", !0);
      return I.toString = function() {
        return w;
      }, I;
    }
  };
}
var Xn = { "-": "", _: " ", 0: "0" }, ot = /^\s*\d+/, lu = /^%/, cu = /[\\^$*+?|[\]().{}]/g;
function Q(t, e, n) {
  var r = t < 0 ? "-" : "", i = (r ? -t : t) + "", a = i.length;
  return r + (a < n ? new Array(n - a + 1).join(e) + i : i);
}
function fu(t) {
  return t.replace(cu, "\\$&");
}
function jt(t) {
  return new RegExp("^(?:" + t.map(fu).join("|") + ")", "i");
}
function te(t) {
  return new Map(t.map((e, n) => [e.toLowerCase(), n]));
}
function hu(t, e, n) {
  var r = ot.exec(e.slice(n, n + 1));
  return r ? (t.w = +r[0], n + r[0].length) : -1;
}
function du(t, e, n) {
  var r = ot.exec(e.slice(n, n + 1));
  return r ? (t.u = +r[0], n + r[0].length) : -1;
}
function pu(t, e, n) {
  var r = ot.exec(e.slice(n, n + 2));
  return r ? (t.U = +r[0], n + r[0].length) : -1;
}
function gu(t, e, n) {
  var r = ot.exec(e.slice(n, n + 2));
  return r ? (t.V = +r[0], n + r[0].length) : -1;
}
function mu(t, e, n) {
  var r = ot.exec(e.slice(n, n + 2));
  return r ? (t.W = +r[0], n + r[0].length) : -1;
}
function Zn(t, e, n) {
  var r = ot.exec(e.slice(n, n + 4));
  return r ? (t.y = +r[0], n + r[0].length) : -1;
}
function Gn(t, e, n) {
  var r = ot.exec(e.slice(n, n + 2));
  return r ? (t.y = +r[0] + (+r[0] > 68 ? 1900 : 2e3), n + r[0].length) : -1;
}
function yu(t, e, n) {
  var r = /^(Z)|([+-]\d\d)(?::?(\d\d))?/.exec(e.slice(n, n + 6));
  return r ? (t.Z = r[1] ? 0 : -(r[2] + (r[3] || "00")), n + r[0].length) : -1;
}
function vu(t, e, n) {
  var r = ot.exec(e.slice(n, n + 1));
  return r ? (t.q = r[0] * 3 - 3, n + r[0].length) : -1;
}
function _u(t, e, n) {
  var r = ot.exec(e.slice(n, n + 2));
  return r ? (t.m = r[0] - 1, n + r[0].length) : -1;
}
function Kn(t, e, n) {
  var r = ot.exec(e.slice(n, n + 2));
  return r ? (t.d = +r[0], n + r[0].length) : -1;
}
function wu(t, e, n) {
  var r = ot.exec(e.slice(n, n + 3));
  return r ? (t.m = 0, t.d = +r[0], n + r[0].length) : -1;
}
function Qn(t, e, n) {
  var r = ot.exec(e.slice(n, n + 2));
  return r ? (t.H = +r[0], n + r[0].length) : -1;
}
function xu(t, e, n) {
  var r = ot.exec(e.slice(n, n + 2));
  return r ? (t.M = +r[0], n + r[0].length) : -1;
}
function bu(t, e, n) {
  var r = ot.exec(e.slice(n, n + 2));
  return r ? (t.S = +r[0], n + r[0].length) : -1;
}
function ku(t, e, n) {
  var r = ot.exec(e.slice(n, n + 3));
  return r ? (t.L = +r[0], n + r[0].length) : -1;
}
function Tu(t, e, n) {
  var r = ot.exec(e.slice(n, n + 6));
  return r ? (t.L = Math.floor(r[0] / 1e3), n + r[0].length) : -1;
}
function Cu(t, e, n) {
  var r = lu.exec(e.slice(n, n + 1));
  return r ? n + r[0].length : -1;
}
function Mu(t, e, n) {
  var r = ot.exec(e.slice(n));
  return r ? (t.Q = +r[0], n + r[0].length) : -1;
}
function Su(t, e, n) {
  var r = ot.exec(e.slice(n));
  return r ? (t.s = +r[0], n + r[0].length) : -1;
}
function Jn(t, e) {
  return Q(t.getDate(), e, 2);
}
function Eu(t, e) {
  return Q(t.getHours(), e, 2);
}
function Du(t, e) {
  return Q(t.getHours() % 12 || 12, e, 2);
}
function Au(t, e) {
  return Q(1 + fe.count(St(t), t), e, 3);
}
function Fr(t, e) {
  return Q(t.getMilliseconds(), e, 3);
}
function Nu(t, e) {
  return Fr(t, e) + "000";
}
function Ru(t, e) {
  return Q(t.getMonth() + 1, e, 2);
}
function Uu(t, e) {
  return Q(t.getMinutes(), e, 2);
}
function Fu(t, e) {
  return Q(t.getSeconds(), e, 2);
}
function Lu(t) {
  var e = t.getDay();
  return e === 0 ? 7 : e;
}
function Iu(t, e) {
  return Q(Ie.count(St(t) - 1, t), e, 2);
}
function Lr(t) {
  var e = t.getDay();
  return e >= 4 || e === 0 ? Vt(t) : Vt.ceil(t);
}
function zu(t, e) {
  return t = Lr(t), Q(Vt.count(St(t), t) + (St(t).getDay() === 4), e, 2);
}
function Ou(t) {
  return t.getDay();
}
function $u(t, e) {
  return Q(Ne.count(St(t) - 1, t), e, 2);
}
function Hu(t, e) {
  return Q(t.getFullYear() % 100, e, 2);
}
function Yu(t, e) {
  return t = Lr(t), Q(t.getFullYear() % 100, e, 2);
}
function Pu(t, e) {
  return Q(t.getFullYear() % 1e4, e, 4);
}
function qu(t, e) {
  var n = t.getDay();
  return t = n >= 4 || n === 0 ? Vt(t) : Vt.ceil(t), Q(t.getFullYear() % 1e4, e, 4);
}
function Wu(t) {
  var e = t.getTimezoneOffset();
  return (e > 0 ? "-" : (e *= -1, "+")) + Q(e / 60 | 0, "0", 2) + Q(e % 60, "0", 2);
}
function jn(t, e) {
  return Q(t.getUTCDate(), e, 2);
}
function Vu(t, e) {
  return Q(t.getUTCHours(), e, 2);
}
function Bu(t, e) {
  return Q(t.getUTCHours() % 12 || 12, e, 2);
}
function Xu(t, e) {
  return Q(1 + _n.count(Ft(t), t), e, 3);
}
function Ir(t, e) {
  return Q(t.getUTCMilliseconds(), e, 3);
}
function Zu(t, e) {
  return Ir(t, e) + "000";
}
function Gu(t, e) {
  return Q(t.getUTCMonth() + 1, e, 2);
}
function Ku(t, e) {
  return Q(t.getUTCMinutes(), e, 2);
}
function Qu(t, e) {
  return Q(t.getUTCSeconds(), e, 2);
}
function Ju(t) {
  var e = t.getUTCDay();
  return e === 0 ? 7 : e;
}
function ju(t, e) {
  return Q(Ur.count(Ft(t) - 1, t), e, 2);
}
function zr(t) {
  var e = t.getUTCDay();
  return e >= 4 || e === 0 ? Bt(t) : Bt.ceil(t);
}
function tl(t, e) {
  return t = zr(t), Q(Bt.count(Ft(t), t) + (Ft(t).getUTCDay() === 4), e, 2);
}
function el(t) {
  return t.getUTCDay();
}
function nl(t, e) {
  return Q(Re.count(Ft(t) - 1, t), e, 2);
}
function rl(t, e) {
  return Q(t.getUTCFullYear() % 100, e, 2);
}
function il(t, e) {
  return t = zr(t), Q(t.getUTCFullYear() % 100, e, 2);
}
function ol(t, e) {
  return Q(t.getUTCFullYear() % 1e4, e, 4);
}
function al(t, e) {
  var n = t.getUTCDay();
  return t = n >= 4 || n === 0 ? Bt(t) : Bt.ceil(t), Q(t.getUTCFullYear() % 1e4, e, 4);
}
function sl() {
  return "+0000";
}
function tr() {
  return "%";
}
function er(t) {
  return +t;
}
function nr(t) {
  return Math.floor(+t / 1e3);
}
var $t, Xt;
ul({
  dateTime: "%x, %X",
  date: "%-m/%-d/%Y",
  time: "%-I:%M:%S %p",
  periods: ["AM", "PM"],
  days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  shortDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  shortMonths: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
});
function ul(t) {
  return $t = uu(t), Xt = $t.format, $t.parse, $t.utcFormat, $t.utcParse, $t;
}
function ll(t) {
  return new Date(t);
}
function cl(t) {
  return t instanceof Date ? +t : +/* @__PURE__ */ new Date(+t);
}
function Or(t, e, n, r, i, a, o, u, l, s) {
  var c = Vs(), m = c.invert, p = c.domain, g = s(".%L"), z = s(":%S"), q = s("%I:%M"), Z = s("%I %p"), N = s("%a %d"), J = s("%b %d"), X = s("%B"), F = s("%Y");
  function U(b) {
    return (l(b) < b ? g : u(b) < b ? z : o(b) < b ? q : a(b) < b ? Z : r(b) < b ? i(b) < b ? N : J : n(b) < b ? X : F)(b);
  }
  return c.invert = function(b) {
    return new Date(m(b));
  }, c.domain = function(b) {
    return arguments.length ? p(Array.from(b, cl)) : p().map(ll);
  }, c.ticks = function(b) {
    var D = p();
    return t(D[0], D[D.length - 1], b ?? 10);
  }, c.tickFormat = function(b, D) {
    return D == null ? U : s(D);
  }, c.nice = function(b) {
    var D = p();
    return (!b || typeof b.range != "function") && (b = e(D[0], D[D.length - 1], b ?? 10)), b ? p(Bs(D, b)) : c;
  }, c.copy = function() {
    return qs(c, Or(t, e, n, r, i, a, o, u, l, s));
  }, c;
}
function $r() {
  return zs.apply(Or(au, su, St, wn, Ie, fe, vn, yn, Yt, Xt).domain([new Date(2e3, 0, 1), new Date(2e3, 0, 2)]), arguments);
}
const me = (t) => () => t;
function fl(t, {
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
function Tt(t, e, n) {
  this.k = t, this.x = e, this.y = n;
}
Tt.prototype = {
  constructor: Tt,
  scale: function(t) {
    return t === 1 ? this : new Tt(this.k * t, this.x, this.y);
  },
  translate: function(t, e) {
    return t === 0 & e === 0 ? this : new Tt(this.k, this.x + this.k * t, this.y + this.k * e);
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
var Zt = new Tt(1, 0, 0);
Tt.prototype;
function Xe(t) {
  t.stopImmediatePropagation();
}
function ee(t) {
  t.preventDefault(), t.stopImmediatePropagation();
}
function hl(t) {
  return (!t.ctrlKey || t.type === "wheel") && !t.button;
}
function dl() {
  var t = this;
  return t instanceof SVGElement ? (t = t.ownerSVGElement || t, t.hasAttribute("viewBox") ? (t = t.viewBox.baseVal, [[t.x, t.y], [t.x + t.width, t.y + t.height]]) : [[0, 0], [t.width.baseVal.value, t.height.baseVal.value]]) : [[0, 0], [t.clientWidth, t.clientHeight]];
}
function rr() {
  return this.__zoom || Zt;
}
function pl(t) {
  return -t.deltaY * (t.deltaMode === 1 ? 0.05 : t.deltaMode ? 1 : 2e-3) * (t.ctrlKey ? 10 : 1);
}
function gl() {
  return navigator.maxTouchPoints || "ontouchstart" in this;
}
function ml(t, e, n) {
  var r = t.invertX(e[0][0]) - n[0][0], i = t.invertX(e[1][0]) - n[1][0], a = t.invertY(e[0][1]) - n[0][1], o = t.invertY(e[1][1]) - n[1][1];
  return t.translate(
    i > r ? (r + i) / 2 : Math.min(0, r) || Math.max(0, i),
    o > a ? (a + o) / 2 : Math.min(0, a) || Math.max(0, o)
  );
}
function Hr() {
  var t = hl, e = dl, n = ml, r = pl, i = gl, a = [0, 1 / 0], o = [[-1 / 0, -1 / 0], [1 / 0, 1 / 0]], u = 250, l = Ca, s = sn("start", "zoom", "end"), c, m, p, g = 500, z = 150, q = 0, Z = 10;
  function N(d) {
    d.property("__zoom", rr).on("wheel.zoom", f, { passive: !1 }).on("mousedown.zoom", h).on("dblclick.zoom", v).filter(i).on("touchstart.zoom", S).on("touchmove.zoom", C).on("touchend.zoom touchcancel.zoom", P).style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
  }
  N.transform = function(d, M, _, x) {
    var R = d.selection ? d.selection() : d;
    R.property("__zoom", rr), d !== R ? U(d, M, _, x) : R.interrupt().each(function() {
      b(this, arguments).event(x).start().zoom(null, typeof M == "function" ? M.apply(this, arguments) : M).end();
    });
  }, N.scaleBy = function(d, M, _, x) {
    N.scaleTo(d, function() {
      var R = this.__zoom.k, k = typeof M == "function" ? M.apply(this, arguments) : M;
      return R * k;
    }, _, x);
  }, N.scaleTo = function(d, M, _, x) {
    N.transform(d, function() {
      var R = e.apply(this, arguments), k = this.__zoom, O = _ == null ? F(R) : typeof _ == "function" ? _.apply(this, arguments) : _, E = k.invert(O), L = typeof M == "function" ? M.apply(this, arguments) : M;
      return n(X(J(k, L), O, E), R, o);
    }, _, x);
  }, N.translateBy = function(d, M, _, x) {
    N.transform(d, function() {
      return n(this.__zoom.translate(
        typeof M == "function" ? M.apply(this, arguments) : M,
        typeof _ == "function" ? _.apply(this, arguments) : _
      ), e.apply(this, arguments), o);
    }, null, x);
  }, N.translateTo = function(d, M, _, x, R) {
    N.transform(d, function() {
      var k = e.apply(this, arguments), O = this.__zoom, E = x == null ? F(k) : typeof x == "function" ? x.apply(this, arguments) : x;
      return n(Zt.translate(E[0], E[1]).scale(O.k).translate(
        typeof M == "function" ? -M.apply(this, arguments) : -M,
        typeof _ == "function" ? -_.apply(this, arguments) : -_
      ), k, o);
    }, x, R);
  };
  function J(d, M) {
    return M = Math.max(a[0], Math.min(a[1], M)), M === d.k ? d : new Tt(M, d.x, d.y);
  }
  function X(d, M, _) {
    var x = M[0] - _[0] * d.k, R = M[1] - _[1] * d.k;
    return x === d.x && R === d.y ? d : new Tt(d.k, x, R);
  }
  function F(d) {
    return [(+d[0][0] + +d[1][0]) / 2, (+d[0][1] + +d[1][1]) / 2];
  }
  function U(d, M, _, x) {
    d.on("start.zoom", function() {
      b(this, arguments).event(x).start();
    }).on("interrupt.zoom end.zoom", function() {
      b(this, arguments).event(x).end();
    }).tween("zoom", function() {
      var R = this, k = arguments, O = b(R, k).event(x), E = e.apply(R, k), L = _ == null ? F(E) : typeof _ == "function" ? _.apply(R, k) : _, A = Math.max(E[1][0] - E[0][0], E[1][1] - E[0][1]), B = R.__zoom, G = typeof M == "function" ? M.apply(R, k) : M, j = l(B.invert(L).concat(A / B.k), G.invert(L).concat(A / G.k));
      return function(tt) {
        if (tt === 1) tt = G;
        else {
          var Y = j(tt), w = A / Y[2];
          tt = new Tt(w, L[0] - Y[0] * w, L[1] - Y[1] * w);
        }
        O.zoom(null, tt);
      };
    });
  }
  function b(d, M, _) {
    return !_ && d.__zooming || new D(d, M);
  }
  function D(d, M) {
    this.that = d, this.args = M, this.active = 0, this.sourceEvent = null, this.extent = e.apply(d, M), this.taps = 0;
  }
  D.prototype = {
    event: function(d) {
      return d && (this.sourceEvent = d), this;
    },
    start: function() {
      return ++this.active === 1 && (this.that.__zooming = this, this.emit("start")), this;
    },
    zoom: function(d, M) {
      return this.mouse && d !== "mouse" && (this.mouse[1] = M.invert(this.mouse[0])), this.touch0 && d !== "touch" && (this.touch0[1] = M.invert(this.touch0[0])), this.touch1 && d !== "touch" && (this.touch1[1] = M.invert(this.touch1[0])), this.that.__zoom = M, this.emit("zoom"), this;
    },
    end: function() {
      return --this.active === 0 && (delete this.that.__zooming, this.emit("end")), this;
    },
    emit: function(d) {
      var M = xt(this.that).datum();
      s.call(
        d,
        this.that,
        new fl(d, {
          sourceEvent: this.sourceEvent,
          target: N,
          transform: this.that.__zoom,
          dispatch: s
        }),
        M
      );
    }
  };
  function f(d, ...M) {
    if (!t.apply(this, arguments)) return;
    var _ = b(this, M).event(d), x = this.__zoom, R = Math.max(a[0], Math.min(a[1], x.k * Math.pow(2, r.apply(this, arguments)))), k = Dt(d);
    if (_.wheel)
      (_.mouse[0][0] !== k[0] || _.mouse[0][1] !== k[1]) && (_.mouse[1] = x.invert(_.mouse[0] = k)), clearTimeout(_.wheel);
    else {
      if (x.k === R) return;
      _.mouse = [k, x.invert(k)], be(this), _.start();
    }
    ee(d), _.wheel = setTimeout(O, z), _.zoom("mouse", n(X(J(x, R), _.mouse[0], _.mouse[1]), _.extent, o));
    function O() {
      _.wheel = null, _.end();
    }
  }
  function h(d, ...M) {
    if (p || !t.apply(this, arguments)) return;
    var _ = d.currentTarget, x = b(this, M, !0).event(d), R = xt(d.view).on("mousemove.zoom", L, !0).on("mouseup.zoom", A, !0), k = Dt(d, _), O = d.clientX, E = d.clientY;
    Xo(d.view), Xe(d), x.mouse = [k, this.__zoom.invert(k)], be(this), x.start();
    function L(B) {
      if (ee(B), !x.moved) {
        var G = B.clientX - O, j = B.clientY - E;
        x.moved = G * G + j * j > q;
      }
      x.event(B).zoom("mouse", n(X(x.that.__zoom, x.mouse[0] = Dt(B, _), x.mouse[1]), x.extent, o));
    }
    function A(B) {
      R.on("mousemove.zoom mouseup.zoom", null), Zo(B.view, x.moved), ee(B), x.event(B).end();
    }
  }
  function v(d, ...M) {
    if (t.apply(this, arguments)) {
      var _ = this.__zoom, x = Dt(d.changedTouches ? d.changedTouches[0] : d, this), R = _.invert(x), k = _.k * (d.shiftKey ? 0.5 : 2), O = n(X(J(_, k), x, R), e.apply(this, M), o);
      ee(d), u > 0 ? xt(this).transition().duration(u).call(U, O, x, d) : xt(this).call(N.transform, O, x, d);
    }
  }
  function S(d, ...M) {
    if (t.apply(this, arguments)) {
      var _ = d.touches, x = _.length, R = b(this, M, d.changedTouches.length === x).event(d), k, O, E, L;
      for (Xe(d), O = 0; O < x; ++O)
        E = _[O], L = Dt(E, this), L = [L, this.__zoom.invert(L), E.identifier], R.touch0 ? !R.touch1 && R.touch0[2] !== L[2] && (R.touch1 = L, R.taps = 0) : (R.touch0 = L, k = !0, R.taps = 1 + !!c);
      c && (c = clearTimeout(c)), k && (R.taps < 2 && (m = L[0], c = setTimeout(function() {
        c = null;
      }, g)), be(this), R.start());
    }
  }
  function C(d, ...M) {
    if (this.__zooming) {
      var _ = b(this, M).event(d), x = d.changedTouches, R = x.length, k, O, E, L;
      for (ee(d), k = 0; k < R; ++k)
        O = x[k], E = Dt(O, this), _.touch0 && _.touch0[2] === O.identifier ? _.touch0[0] = E : _.touch1 && _.touch1[2] === O.identifier && (_.touch1[0] = E);
      if (O = _.that.__zoom, _.touch1) {
        var A = _.touch0[0], B = _.touch0[1], G = _.touch1[0], j = _.touch1[1], tt = (tt = G[0] - A[0]) * tt + (tt = G[1] - A[1]) * tt, Y = (Y = j[0] - B[0]) * Y + (Y = j[1] - B[1]) * Y;
        O = J(O, Math.sqrt(tt / Y)), E = [(A[0] + G[0]) / 2, (A[1] + G[1]) / 2], L = [(B[0] + j[0]) / 2, (B[1] + j[1]) / 2];
      } else if (_.touch0) E = _.touch0[0], L = _.touch0[1];
      else return;
      _.zoom("touch", n(X(O, E, L), _.extent, o));
    }
  }
  function P(d, ...M) {
    if (this.__zooming) {
      var _ = b(this, M).event(d), x = d.changedTouches, R = x.length, k, O;
      for (Xe(d), p && clearTimeout(p), p = setTimeout(function() {
        p = null;
      }, g), k = 0; k < R; ++k)
        O = x[k], _.touch0 && _.touch0[2] === O.identifier ? delete _.touch0 : _.touch1 && _.touch1[2] === O.identifier && delete _.touch1;
      if (_.touch1 && !_.touch0 && (_.touch0 = _.touch1, delete _.touch1), _.touch0) _.touch0[1] = this.__zoom.invert(_.touch0[0]);
      else if (_.end(), _.taps === 2 && (O = Dt(O, this), Math.hypot(m[0] - O[0], m[1] - O[1]) < Z)) {
        var E = xt(this).on("dblclick.zoom");
        E && E.apply(this, arguments);
      }
    }
  }
  return N.wheelDelta = function(d) {
    return arguments.length ? (r = typeof d == "function" ? d : me(+d), N) : r;
  }, N.filter = function(d) {
    return arguments.length ? (t = typeof d == "function" ? d : me(!!d), N) : t;
  }, N.touchable = function(d) {
    return arguments.length ? (i = typeof d == "function" ? d : me(!!d), N) : i;
  }, N.extent = function(d) {
    return arguments.length ? (e = typeof d == "function" ? d : me([[+d[0][0], +d[0][1]], [+d[1][0], +d[1][1]]]), N) : e;
  }, N.scaleExtent = function(d) {
    return arguments.length ? (a[0] = +d[0], a[1] = +d[1], N) : [a[0], a[1]];
  }, N.translateExtent = function(d) {
    return arguments.length ? (o[0][0] = +d[0][0], o[1][0] = +d[1][0], o[0][1] = +d[0][1], o[1][1] = +d[1][1], N) : [[o[0][0], o[0][1]], [o[1][0], o[1][1]]];
  }, N.constrain = function(d) {
    return arguments.length ? (n = d, N) : n;
  }, N.duration = function(d) {
    return arguments.length ? (u = +d, N) : u;
  }, N.interpolate = function(d) {
    return arguments.length ? (l = d, N) : l;
  }, N.on = function() {
    var d = s.on.apply(s, arguments);
    return d === s ? N : d;
  }, N.clickDistance = function(d) {
    return arguments.length ? (q = (d = +d) * d, N) : Math.sqrt(q);
  }, N.tapDistance = function(d) {
    return arguments.length ? (Z = +d, N) : Z;
  }, N;
}
class yl {
  /**
   * Render a zoomable horizontal timeline with baseline, full-axis, and interactive dots.
   */
  static render(e, n, r) {
    n.innerHTML = "";
    const i = { top: 10, right: 10, bottom: 20, left: 10 }, a = n.clientWidth - i.left - i.right, o = n.clientHeight - i.top - i.bottom, u = xt(n), l = u.append("svg").attr("width", a + i.left + i.right).attr("height", o + i.top + i.bottom), s = l.append("g").attr("transform", `translate(${i.left},${i.top})`), c = e.items.map((U) => U.start), [m, p] = or(c), g = $r().domain([m, p]).range([0, a]);
    s.append("line").attr("x1", 0).attr("x2", a).attr("y1", o / 2).attr("y2", o / 2).attr("stroke", "var(--tl-primary-color, #4285f4)").attr("stroke-width", 2);
    const z = s.append("g").attr("transform", `translate(0,${o + 5})`).call(
      Sn(g).tickValues(c).tickFormat(Xt("%Y-%m-%d"))
    );
    z.attr("fill", null), z.select(".domain").attr("stroke", "var(--tl-primary-color, #4285f4)").attr("fill", "none"), z.selectAll(".tick line").attr("stroke", "var(--tl-primary-color, #4285f4)"), z.selectAll(".tick text").attr("fill", "var(--tl-primary-color, #4285f4)").attr("font-family", "var(--tl-font, system-ui)").attr("font-size", "10px");
    const q = s.append("g");
    q.selectAll("circle").data(e.items).enter().append("circle").attr("cx", (U) => g(U.start)).attr("cy", o / 2).attr("r", 6).attr("fill", "var(--tl-primary-color, #4285f4)").on("click", (U, b) => r.onItemClick?.(b, U)).on("mouseover", (U, b) => r.onItemHover?.(b, U));
    const Z = s.append("g");
    Z.selectAll("text").data(e.items).enter().append("text").attr("x", (U) => g(U.start)).attr("y", o / 2 - 10).attr("text-anchor", "middle").text((U) => U.title).attr("fill", "var(--tl-primary-color, #4285f4)").attr("font-family", "var(--tl-font, system-ui)").attr("font-size", "12px");
    const N = u.append("div").attr("class", "tl-tooltip").style("position", "absolute").style("pointer-events", "none").style("padding", "6px 10px").style("border-radius", "4px").style("background", "var(--tl-tooltip-bg, rgba(0,0,0,0.7))").style("color", "var(--tl-tooltip-color, #fff)").style("font-family", "var(--tl-font, system-ui)").style("font-size", "12px").style("opacity", "0");
    function J(U) {
      const b = U.start.toLocaleDateString(), D = U.end ? ` – ${U.end.toLocaleDateString()}` : "", f = U.description ? `<div>${U.description}</div>` : "";
      return `<strong>${U.title}</strong><div>${b}${D}</div>${f}`;
    }
    q.selectAll("circle").on("mouseover", (U, b) => N.html(J(b)).style("opacity", "1")).on("mousemove", (U) => N.style("left", `${U.pageX + 10}px`).style("top", `${U.pageY + 10}px`)).on("mouseout", () => N.style("opacity", "0"));
    const X = (U) => {
      const b = U.rescaleX(g);
      z.call(
        Sn(b).tickValues(c).tickFormat(Xt("%Y-%m-%d"))
      ), z.selectAll(".tick text").attr("fill", "var(--tl-primary-color, #4285f4)"), q.selectAll("circle").attr("cx", (D) => b(D.start)), Z.selectAll("text").attr("x", (D) => b(D.start)), r.onRangeChange?.(b.domain());
    }, F = Hr().scaleExtent([1, 10]).translateExtent([[0, 0], [a, o]]).extent([[0, 0], [a, o]]).on("zoom", (U) => X(U.transform));
    l.call(F), F.transform(l, Zt), X(Zt);
  }
}
class vl {
  /**
   * Render a zoomable vertical timeline: axis + baseline + dots + labels.
   */
  static render(e, n, r) {
    n.innerHTML = "";
    const i = { top: 20, right: 10, bottom: 20, left: 60 }, a = n.clientWidth - i.left - i.right, o = n.clientHeight - i.top - i.bottom, u = xt(n), l = u.append("svg").attr("width", i.left + a + i.right).attr("height", i.top + o + i.bottom);
    l.append("rect").attr("width", i.left + a + i.right).attr("height", i.top + o + i.bottom).style("fill", "none").style("pointer-events", "all");
    const s = l.append("g").attr("transform", `translate(${i.left},${i.top})`), c = e.items.map((F) => F.start), [m, p] = or(c), g = $r().domain([m, p]).range([0, o]);
    if (r.showTodayLine) {
      const F = g(/* @__PURE__ */ new Date());
      s.append("line").attr("x1", 0).attr("x2", a).attr("y1", F).attr("y2", F).attr("stroke", "var(--tl-primary-color, steelblue)").attr("stroke-dasharray", "4 2");
    }
    s.append("line").attr("x1", a / 2).attr("x2", a / 2).attr("y1", 0).attr("y2", o).attr("stroke", "var(--tl-primary-color, steelblue)").attr("stroke-width", 2);
    const z = s.append("g").call(
      En(g).tickValues(c).tickFormat(Xt("%Y-%m-%d"))
    );
    z.attr("fill", null), z.select(".domain").attr("stroke", "var(--tl-primary-color, steelblue)").attr("fill", "none"), z.selectAll(".tick line").attr("stroke", "var(--tl-primary-color, steelblue)"), z.selectAll(".tick text").attr("fill", "var(--tl-primary-color, steelblue)").attr("font-family", "var(--tl-font, sans-serif)").attr("font-size", "10px").attr("dx", "-8");
    const q = u.append("div").attr("class", "tl-tooltip").style("position", "absolute").style("pointer-events", "none").style("padding", "6px 10px").style("border-radius", "4px").style("background", "var(--tl-tooltip-bg, rgba(0,0,0,0.7))").style("color", "var(--tl-tooltip-color, #fff)").style("font-family", "var(--tl-font, sans-serif)").style("font-size", "12px").style("opacity", "0");
    function Z(F) {
      const U = F.start.toLocaleDateString(), b = F.end ? ` – ${F.end.toLocaleDateString()}` : "", D = F.description ? `<div>${F.description}</div>` : "";
      return `<strong>${F.title}</strong><div>${U}${b}</div>${D}`;
    }
    const N = s.append("g").selectAll("g.event").data(e.items).enter().append("g").attr("class", "event");
    N.append("circle").attr("cx", a / 2).attr("cy", (F) => g(F.start)).attr("r", 6).attr("fill", "var(--tl-primary-color, steelblue)").on("click", (F, U) => r.onItemClick?.(U, F)).on("mouseover", (F, U) => {
      r.onItemHover?.(U, F), q.html(Z(U)).style("opacity", "1");
    }).on("mousemove", (F) => q.style("left", `${F.pageX + 10}px`).style("top", `${F.pageY + 10}px`)).on("mouseout", () => q.style("opacity", "0")), N.append("text").attr("x", a / 2 + 12).attr("y", (F) => g(F.start) + 4).text((F) => F.title).attr("fill", "var(--tl-primary-color, steelblue)").attr("font-family", "var(--tl-font, sans-serif)").attr("font-size", "12px");
    const J = (F) => {
      const U = F.rescaleY(g);
      z.call(
        En(U).tickValues(c).tickFormat(Xt("%Y-%m-%d"))
      ), z.selectAll(".tick text").attr("fill", "var(--tl-primary-color, steelblue)"), N.selectAll("circle").attr("cy", (b) => U(b.start)), N.selectAll("text").attr("y", (b) => U(b.start) + 4), r.onRangeChange?.(U.domain());
    }, X = Hr().scaleExtent([1, 10]).translateExtent([[0, 0], [a, o]]).extent([[0, 0], [a, o]]).on("zoom", (F) => J(F.transform));
    l.call(X), X.transform(l, Zt), J(Zt);
  }
}
class _l {
  /** Render events as a responsive, themeable CSS grid of cards. */
  static render(e, n, r) {
    n.innerHTML = "";
    const i = "chrono-leaf-grid-styles";
    if (!document.getElementById(i)) {
      const o = document.createElement("style");
      o.id = i, o.textContent = `
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
      `, document.head.appendChild(o);
    }
    const a = document.createElement("div");
    a.className = "tl-grid", e.items.forEach((o) => {
      const u = document.createElement("div");
      u.className = "tl-grid-item", o.background?.type === "color" && (u.style.backgroundColor = o.background.source), r.onItemClick && u.addEventListener("click", (c) => r.onItemClick(o, c)), r.onItemHover && u.addEventListener("mouseenter", (c) => r.onItemHover(o, c));
      const l = document.createElement("h4");
      l.textContent = o.title, u.appendChild(l);
      const s = document.createElement("time");
      if (s.textContent = o.start.toLocaleDateString() + (o.end ? ` – ${o.end.toLocaleDateString()}` : ""), u.appendChild(s), o.description) {
        const c = document.createElement("p");
        c.textContent = o.description, u.appendChild(c);
      }
      a.appendChild(u);
    }), n.appendChild(a);
  }
}
function wl(t) {
  return t.replace(/[A-Z]/g, (e) => "-" + e.toLowerCase());
}
function xl(t, e) {
  if (t.classList.remove("tl-theme-light", "tl-theme-dark"), Array.from(t.style).forEach((n) => {
    n.startsWith("--tl-") && t.style.removeProperty(n);
  }), !!e)
    if (e === "light" || e === "dark")
      t.classList.add(`tl-theme-${e}`);
    else
      for (const [n, r] of Object.entries(e)) {
        if (r == null) continue;
        const i = `--tl-${wl(n)}`;
        t.style.setProperty(i, r);
      }
}
class oe {
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
    switch (e.innerHTML = "", xl(e, this.config.theme), this.config.mode) {
      case "slider":
        yl.render(this, e, this.config);
        break;
      case "vertical":
        vl.render(this, e, this.config);
        break;
      case "grid":
        _l.render(this, e, this.config);
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
    const n = he.parse(e, "csv");
    return new oe(n);
  }
  static fromJSON(e) {
    const n = he.parse(e, "json");
    return new oe(n);
  }
  static fromXML(e) {
    const n = he.parse(e, "xml");
    return new oe(n);
  }
  static fromTEI(e) {
    const n = he.parse(e, "tei");
    return new oe(n);
  }
}
const ir = "chrono-leaf-default-themes";
if (!document.getElementById(ir)) {
  const t = document.createElement("style");
  t.id = ir, t.textContent = `
    /* Theme classes just set variables */
    .tl-theme-light { 
      --tl-primary-color: #4285f4;
      --tl-background-color: #fff;
      --tl-font: system-ui, sans-serif;
      --tl-border-radius: 4px;
      --tl-tooltip-bg: rgba(0,0,0,0.7);
      --tl-tooltip-color: #fff;
    }
    .tl-theme-dark {
      --tl-primary-color: #8ab4f8;
      --tl-background-color: #222;
      --tl-font: system-ui, sans-serif;
      --tl-border-radius: 4px;
      --tl-tooltip-bg: rgba(255,255,255,0.85);
      --tl-tooltip-color: #000;
    }

    /* Base container styles */
    .tl-container, .tl-grid {
      background: var(--tl-background-color);
      font-family: var(--tl-font);
      border-radius: var(--tl-border-radius);
      color: inherit;
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
  oe as Timeline
};
//# sourceMappingURL=chrono-leaf.es.js.map
