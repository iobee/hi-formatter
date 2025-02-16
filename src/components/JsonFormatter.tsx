import React, { useState, useRef, useEffect } from 'react';
import { Card, Input, Button, Space, Radio, InputNumber, message, Switch } from 'antd';
import fmt2json from 'format-to-json';

const { TextArea } = Input;

interface FormatOptions {
  indent: number;
  expand: boolean;
  strict: boolean;
  escape: boolean;
  unscape: boolean;
  keyQtMark: "'" | '"' | '';
  valQtMark: "'" | '"';
}

interface LineInfo {
  text: string;
  level: number;
  isCollapsible: boolean;
  isCollapsed: boolean;
  startLine: number;
  endLine: number;
}

const JsonFormatter: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [formattedLines, setFormattedLines] = useState<LineInfo[]>([]);
  const [defaultExpanded, setDefaultExpanded] = useState(false);
  const [options, setOptions] = useState<FormatOptions>({
    indent: 2,
    expand: true,
    strict: false,
    escape: false,
    unscape: false,
    keyQtMark: '"',
    valQtMark: '"',
  });

  const processFormattedResult = (result: string): LineInfo[] => {
    const lines = result.split('\n');
    const processedLines: LineInfo[] = [];
    const bracketStack: { index: number; line: LineInfo }[] = [];
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      const level = (line.match(/^\s*/)?.[0]?.length || 0) / options.indent;
      
      const isOpenBracket = /[{\[]\s*$/.test(trimmedLine);
      const isCloseBracket = /^[}\]]/.test(trimmedLine);
      
      const lineInfo: LineInfo = {
        text: line,
        level,
        isCollapsible: isOpenBracket,
        isCollapsed: !defaultExpanded && isOpenBracket,
        startLine: index,
        endLine: -1
      };
      
      if (isOpenBracket) {
        bracketStack.push({ index, line: lineInfo });
      }
      
      if (isCloseBracket && bracketStack.length > 0) {
        const openBracket = bracketStack.pop()!;
        openBracket.line.endLine = index;
      }
      
      processedLines.push(lineInfo);
    });
    
    return processedLines;
  };

  const handleFormat = () => {
    try {
      const result = fmt2json(inputValue, {
        ...options,
        withDetails: true,
      });

      if ('result' in result) {
        const lines = processFormattedResult(result.result);
        setFormattedLines(lines);
        
        if (result.errFormat) {
          message.error(result.message);
        } else {
          message.success(`格式化成功！共 ${result.fmtLines} 行`);
        }
      }
    } catch (error) {
      message.error('格式化失败：' + (error as Error).message);
      setFormattedLines([]);
    }
  };

  const toggleCollapse = (index: number) => {
    setFormattedLines(prevLines => {
      return prevLines.map((line, i) => {
        if (i === index && line.isCollapsible && line.endLine !== -1) {
          return { ...line, isCollapsed: !line.isCollapsed };
        }
        return line;
      });
    });
  };

  const handleClear = () => {
    setInputValue('');
    setFormattedLines([]);
  };

  const renderLine = (line: LineInfo, index: number) => {
    const style: React.CSSProperties = {
      paddingLeft: `${line.level * 20}px`,
      cursor: line.isCollapsible ? 'pointer' : 'default',
      whiteSpace: 'pre',
      fontFamily: 'monospace',
    };

    const collapseIcon = line.isCollapsible ? (
      <span style={{ marginRight: '5px' }}>
        {line.isCollapsed ? '▶' : '▼'}
      </span>
    ) : null;

    return (
      <div
        key={index}
        style={style}
        onClick={() => {
          console.log('Clicked line info:', {
            text: line.text,
            level: line.level,
            isCollapsible: line.isCollapsible,
            isCollapsed: line.isCollapsed,
            startLine: line.startLine,
            endLine: line.endLine
          });
          if (line.isCollapsible) {
            toggleCollapse(index);
          }
        }}
      >
        {collapseIcon}{line.text}
      </div>
    );
  };

  const getVisibleLines = () => {
    const visibleLines: LineInfo[] = [];
    let skipUntil = -1;

    formattedLines.forEach((line, index) => {
      if (index <= skipUntil) return;

      visibleLines.push(line);

      if (line.isCollapsible && line.isCollapsed) {
        skipUntil = line.endLine;
      }
    });

    return visibleLines;
  };

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card title="选项设置">
          <Space wrap>
            <span>缩进空格：</span>
            <InputNumber
              min={0}
              max={8}
              value={options.indent}
              onChange={(value) => setOptions({ ...options, indent: value || 2 })}
            />
            
            <span>引号类型：</span>
            <Radio.Group
              value={options.keyQtMark}
              onChange={(e) => setOptions({ 
                ...options, 
                keyQtMark: e.target.value,
                valQtMark: e.target.value 
              })}
            >
              <Radio.Button value='"'>双引号</Radio.Button>
              <Radio.Button value="'">单引号</Radio.Button>
            </Radio.Group>

            <span>默认展开：</span>
            <Switch
              checked={defaultExpanded}
              onChange={setDefaultExpanded}
            />

            <Button
              type="primary"
              onClick={handleFormat}
            >
              格式化
            </Button>
            
            <Button onClick={handleClear}>
              清空
            </Button>
          </Space>
        </Card>

        <div style={{ display: 'flex', gap: '24px' }}>
          <Card title="输入 JSON" style={{ flex: 1 }}>
            <TextArea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="请输入要格式化的 JSON 字符串"
              style={{ height: '400px' }}
            />
          </Card>

          <Card title="格式化结果" style={{ flex: 1 }}>
            <div 
              style={{ 
                height: '400px', 
                overflow: 'auto', 
                border: '1px solid #d9d9d9', 
                borderRadius: '6px', 
                padding: '8px',
                backgroundColor: '#fff'
              }}
            >
              {formattedLines.length > 0 ? (
                getVisibleLines().map((line, index) => renderLine(line, index))
              ) : (
                <div style={{ color: '#999', textAlign: 'center', marginTop: '20px' }}>
                  等待输入...
                </div>
              )}
            </div>
          </Card>
        </div>
      </Space>
    </div>
  );
};

export default JsonFormatter;
