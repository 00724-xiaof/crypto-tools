import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Copy, RefreshCw, Code2, Check, Terminal } from 'lucide-react'

type TargetLang = 'javascript' | 'node-axios' | 'python' | 'go' | 'java' | 'csharp' | 'php' | 'rust'

export function CurlConverterTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [language, setLanguage] = useState<TargetLang>('javascript')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    convert()
  }, [input, language])

  const convert = () => {
    if (!input.trim()) {
      setOutput('')
      return
    }
    
    try {
      const parsed = parseCurl(input)
      let code = ''
      
      switch (language) {
        case 'javascript':
          code = generateFetch(parsed)
          break
        case 'node-axios':
          code = generateAxios(parsed)
          break
        case 'python':
          code = generatePython(parsed)
          break
        case 'go':
          code = generateGo(parsed)
          break
        case 'java':
          code = generateJava(parsed)
          break
        case 'csharp':
          code = generateCSharp(parsed)
          break
        case 'php':
          code = generatePHP(parsed)
          break
        case 'rust':
          code = generateRust(parsed)
          break
      }
      
      setOutput(code)
    } catch (e) {
      // Silent error
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="h-full flex flex-col gap-4 p-6 bg-background">
      <div className="flex items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Terminal className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Curl 转换器</h2>
            <p className="text-sm text-muted-foreground">将 Curl 命令转换为多种编程语言的请求代码</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-sm font-medium text-muted-foreground">目标语言:</span>
           <Select value={language} onValueChange={(v: TargetLang) => setLanguage(v)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="javascript">JavaScript (Fetch)</SelectItem>
              <SelectItem value="node-axios">Node.js (Axios)</SelectItem>
              <SelectItem value="python">Python (Requests)</SelectItem>
              <SelectItem value="go">Go (Native)</SelectItem>
              <SelectItem value="java">Java (HttpClient)</SelectItem>
              <SelectItem value="csharp">C# (HttpClient)</SelectItem>
              <SelectItem value="php">PHP (cURL)</SelectItem>
              <SelectItem value="rust">Rust (Reqwest)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-6 min-h-0">
        <div className="flex flex-col gap-3 h-full">
          <div className="flex items-center justify-between">
             <label className="text-sm font-medium flex items-center gap-2">
               <Terminal className="w-4 h-4" />
               Curl 命令
             </label>
             <Button variant="ghost" size="sm" onClick={convert} className="h-7">
               <RefreshCw className="w-3 h-3 mr-1" />
               强制转换
             </Button>
          </div>
          <div className="flex-1 relative border rounded-lg overflow-hidden bg-muted/30 focus-within:ring-2 focus-within:ring-primary/20 transition-all min-h-[300px]">
            <Textarea
              className="absolute inset-0 font-mono text-sm resize-none border-0 focus-visible:ring-0 p-4 leading-relaxed"
              placeholder={`curl -X POST https://api.example.com/data \\
  -H 'Content-Type: application/json' \\
  -d '{"key":"value"}'`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex flex-col gap-3 h-full">
          <div className="flex items-center justify-between">
             <label className="text-sm font-medium flex items-center gap-2">
               <Code2 className="w-4 h-4" />
               生成代码
             </label>
             <Button 
               variant={copied ? "default" : "outline"} 
               size="sm" 
               onClick={copyToClipboard} 
               disabled={!output}
               className="h-7"
             >
               {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
               {copied ? '已复制' : '复制'}
             </Button>
          </div>
          <div className="flex-1 relative border rounded-lg overflow-hidden bg-muted/50 min-h-[300px]">
            <Textarea
              className="absolute inset-0 font-mono text-sm resize-none border-0 focus-visible:ring-0 p-4 bg-transparent leading-relaxed"
              value={output}
              readOnly
              placeholder="// 等待输入..."
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// ... (ParsedCurl interface and parseCurl function remains the same)
interface ParsedCurl {
  url: string
  method: string
  headers: Record<string, string>
  body?: string
}

function parseCurl(curl: string): ParsedCurl {
  const normalized = curl.replace(/[\r\n\\]+/g, ' ').trim()
  
  let url = ''
  let method = 'GET'
  const headers: Record<string, string> = {}
  let body
  
  const args = normalized.split(/\s+(?=(?:[^'"]*['"][^'"]*['"])*[^'"]*$)/).filter(s => s.length > 0)
  if (args[0] === 'curl') args.shift()
  
  for (let i = 0; i < args.length; i++) {
    let arg = args[i]
    
    const stripQuotes = (s: string) => {
      if ((s.startsWith("'") && s.endsWith("'")) || (s.startsWith('"') && s.endsWith('"'))) {
        return s.slice(1, -1)
      }
      return s
    }

    if (arg.startsWith('-')) {
      if (arg === '-X' || arg === '--request') {
        if (i + 1 < args.length) method = stripQuotes(args[++i])
      } else if (arg === '-H' || arg === '--header') {
        if (i + 1 < args.length) {
          const header = stripQuotes(args[++i])
          const parts = header.split(':')
          if (parts.length >= 2) {
            headers[parts[0].trim()] = parts.slice(1).join(':').trim()
          }
        }
      } else if (arg === '-d' || arg === '--data' || arg === '--data-raw' || arg === '--data-binary') {
        if (i + 1 < args.length) {
          body = stripQuotes(args[++i])
          if (method === 'GET') method = 'POST'
        }
      }
    } else {
      if (!url && !arg.startsWith('-')) {
        url = stripQuotes(arg)
      }
    }
  }
  
  return { url, method, headers, body }
}

// ... (Existing generators: generateFetch, generateAxios, generatePython, generateGo)
function generateFetch(parsed: ParsedCurl): string {
  const options: any = {
    method: parsed.method
  }
  
  if (Object.keys(parsed.headers).length > 0) {
    options.headers = parsed.headers
  }
  
  if (parsed.body) {
    options.body = parsed.body
  }
  
  return `fetch('${parsed.url}', ${JSON.stringify(options, null, 2)})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`
}

function generateAxios(parsed: ParsedCurl): string {
  return `const axios = require('axios');

axios({
  method: '${parsed.method.toLowerCase()}',
  url: '${parsed.url}',
  headers: ${JSON.stringify(parsed.headers, null, 2)},
  ${parsed.body ? `data: ${parsed.body}` : ''}
})
  .then(function (response) {
    console.log(JSON.stringify(response.data));
  })
  .catch(function (error) {
    console.log(error);
  });`
}

function generatePython(parsed: ParsedCurl): string {
  let code = `import requests\n\n`
  code += `url = "${parsed.url}"\n\n`
  
  if (Object.keys(parsed.headers).length > 0) {
    code += `headers = ${JSON.stringify(parsed.headers, null, 2)}\n\n`
  } else {
    code += `headers = {}\n\n`
  }
  
  if (parsed.body) {
    code += `payload = ${JSON.stringify(parsed.body)}\n`
    code += `response = requests.request("${parsed.method}", url, headers=headers, data=payload)\n`
  } else {
    code += `response = requests.request("${parsed.method}", url, headers=headers)\n`
  }
  
  code += `\nprint(response.text)`
  return code
}

function generateGo(parsed: ParsedCurl): string {
  return `package main

import (
\t"fmt"
\t"net/http"
\t"io/ioutil"
\t"strings"
)

func main() {
\turl := "${parsed.url}"
\tmethod := "${parsed.method}"

\t${parsed.body ? `payload := strings.NewReader(\`${parsed.body}\`)` : 'payload := nil'}

\tclient := &http.Client {}
\treq, err := http.NewRequest(method, url, payload)
\tif err != nil {
\t\tfmt.Println(err)
\t\treturn
\t}

\t${Object.entries(parsed.headers).map(([k, v]) => `req.Header.Add("${k}", "${v}")`).join('\n\t')}

\tres, err := client.Do(req)
\tif err != nil {
\t\tfmt.Println(err)
\t\treturn
\t}
\tdefer res.Body.Close()

\tbody, err := ioutil.ReadAll(res.Body)
\tif err != nil {
\t\tfmt.Println(err)
\t\treturn
\t}
\tfmt.Println(string(body))
}`
}

// New generators
function generateJava(parsed: ParsedCurl): string {
    return `import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class Main {
    public static void main(String[] args) throws Exception {
        HttpClient client = HttpClient.newHttpClient();
        
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("${parsed.url}"))
            .${parsed.method}(${parsed.body ? `HttpRequest.BodyPublishers.ofString(${JSON.stringify(parsed.body)})` : 'HttpRequest.BodyPublishers.noBody()'})
${Object.entries(parsed.headers).map(([k, v]) => `            .header("${k}", "${v}")`).join('\n')}
            .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        
        System.out.println(response.body());
    }
}`
}

function generateCSharp(parsed: ParsedCurl): string {
    return `using System;
using System.Net.Http;
using System.Threading.Tasks;
${parsed.body ? 'using System.Text;' : ''}

class Program {
    static async Task Main(string[] args) {
        using (var client = new HttpClient()) {
            var request = new HttpRequestMessage {
                Method = HttpMethod.${parsed.method[0].toUpperCase() + parsed.method.slice(1).toLowerCase()},
                RequestUri = new Uri("${parsed.url}"),
${parsed.body ? `                Content = new StringContent(${JSON.stringify(parsed.body)}, Encoding.UTF8, "${parsed.headers['Content-Type'] || 'application/json'}")` : ''}
            };
            
${Object.entries(parsed.headers).filter(([k]) => k.toLowerCase() !== 'content-type').map(([k, v]) => `            request.Headers.TryAddWithoutValidation("${k}", "${v}");`).join('\n')}

            var response = await client.SendAsync(request);
            var responseBody = await response.Content.ReadAsStringAsync();
            
            Console.WriteLine(responseBody);
        }
    }
}`
}

function generatePHP(parsed: ParsedCurl): string {
    return `<?php

$curl = curl_init();

curl_setopt_array($curl, array(
  CURLOPT_URL => '${parsed.url}',
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_ENCODING => '',
  CURLOPT_MAXREDIRS => 10,
  CURLOPT_TIMEOUT => 0,
  CURLOPT_FOLLOWLOCATION => true,
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  CURLOPT_CUSTOMREQUEST => '${parsed.method}',
${parsed.body ? `  CURLOPT_POSTFIELDS => ${JSON.stringify(parsed.body)},` : ''}
  CURLOPT_HTTPHEADER => array(
${Object.entries(parsed.headers).map(([k, v]) => `    '${k}: ${v}'`).join(',\n')}
  ),
));

$response = curl_exec($curl);

curl_close($curl);
echo $response;`
}

function generateRust(parsed: ParsedCurl): string {
    return `use reqwest; // 0.11

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = reqwest::Client::new();
    
    let res = client
        .${parsed.method.toLowerCase()}("${parsed.url}")
${Object.entries(parsed.headers).map(([k, v]) => `        .header("${k}", "${v}")`).join('\n')}
${parsed.body ? `        .body(${JSON.stringify(parsed.body)})` : ''}
        .send()
        .await?
        .text()
        .await?;
        
    println!("{}", res);
    Ok(())
}`
}

