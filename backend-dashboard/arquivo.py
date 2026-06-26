from dash import Dash, html, dcc, Input, Output
import plotly.express as px
import pandas as pd
from database import get_vendas_mensais

# Inicializa o Dash
app = Dash(__name__, url_base_pathname='/dashboard/')

# --- 1. CARREGAMENTO E PREPARAÇÃO DOS DADOS ---
df = get_vendas_mensais(1)

# Gerando o Mapa de Cores Fixo por Produto
lista_produtos_total = df['Produto'].unique()
cores_fixas = {
    produto: px.colors.qualitative.Prism[i % len(px.colors.qualitative.Prism)] 
    for i, produto in enumerate(lista_produtos_total)
}

# Preparando as listas dos filtros (Dropdowns)
lista_produtos = sorted([p for p in df['Produto'].unique() if p != 'Sem Vendas'])
lista_produtos.insert(0, "Todos os Produtos")

lista_meses = sorted(list(df['Mes'].unique()))
lista_meses.append("Todos os Meses")

# --- 2. LAYOUT E DESIGN (CSS EMBUTIDO) ---
font_family = "Segoe UI, Roboto, Helvetica, Arial, sans-serif"

app.layout = html.Div(style={'backgroundColor': '#f4f7f6', 'minHeight': '100vh', 'padding': '40px', 'fontFamily': font_family}, children=[
    
    # Cabeçalho do Dashboard
    html.Div([
        html.H1('Painel de Controle de Estoque', 
                style={'textAlign': 'center', 'color': '#2c3e50', 'margin': '0', 'fontWeight': 'bold', 'fontSize': '36px'}),
        
        html.H2('Análise de Tendências e Previsão de Compras', 
                style={'textAlign': 'center', 'color': '#7f8c8d', 'marginTop': '10px', 'fontSize': '18px', 'fontWeight': 'normal'}),
        
        html.Hr(style={'width': '100px', 'borderColor': '#3498db', 'borderWidth': '3px', 'marginTop': '20px'})
    ], style={'marginBottom': '40px', 'display': 'flex', 'flexDirection': 'column', 'alignItems': 'center'}),

    # Bloco Centralizado (Cards)
    html.Div([
        
        # Filtros Lado a Lado
        html.Div([
            html.Div([
                html.Label("📦 Filtrar por Produto:", style={'fontWeight': '600', 'marginBottom': '10px', 'display': 'block', 'color': '#34495e'}),
                dcc.Dropdown(lista_produtos, value='Todos os Produtos', id='filtro_produto', clearable=False),
            ], style={'width': '48%', 'display': 'inline-block'}),

            html.Div([
                html.Label("📅 Filtrar por Mês:", style={'fontWeight': '600', 'marginBottom': '10px', 'display': 'block', 'color': '#34495e'}),
                dcc.Dropdown(lista_meses, value='Todos os Meses', id='filtro_mes', clearable=False),
            ], style={'width': '48%', 'float': 'right', 'display': 'inline-block'}),
        ], style={'padding': '25px', 'backgroundColor': '#ffffff', 'borderRadius': '12px', 'boxShadow': '0 10px 25px rgba(0,0,0,0.05)', 'marginBottom': '25px'}),

        # Gráfico
        html.Div([
            dcc.Graph(id='grafico_principal', config={'displayModeBar': False})
        ], style={'padding': '20px', 'backgroundColor': '#ffffff', 'borderRadius': '12px', 'boxShadow': '0 10px 25px rgba(0,0,0,0.05)'}),

    ], style={'maxWidth': '1100px', 'margin': '0 auto'}) 
])

# --- 3. CALLBACK (FILTROS DINÂMICOS E GRÁFICO) ---
@app.callback(
    Output('grafico_principal', 'figure'),
    [Input('filtro_produto', 'value'),
     Input('filtro_mes', 'value')]
)
def atualizar_grafico(produto_sel, mes_sel):
    tabela_filtrada = df.copy()

    # Lógica dos filtros cruzados
    if produto_sel != "Todos os Produtos":
        tabela_filtrada = tabela_filtrada.loc[tabela_filtrada['Produto'] == produto_sel]

    if mes_sel != "Todos os Meses":
        tabela_filtrada = tabela_filtrada.loc[tabela_filtrada['Mes'] == mes_sel]

    # Montagem do gráfico de barras
    fig = px.bar(
        tabela_filtrada, 
        x="Mes", 
        y="Quantidade", 
        color="Produto",
        barmode="group",
        color_discrete_map=cores_fixas,
        labels={'Quantidade': 'Unidades Vendidas', 'Mes': 'Mês de Referência'}
    )
    
    # Configuração do Eixo X com o ano de 2026 completo
    fig.update_xaxes(
        type='category', 
        categoryorder='array', 
        categoryarray=['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', 
                       '2026-07', '2026-08', '2026-09', '2026-10', '2026-11', '2026-12'],
        gridcolor='#f0f0f0'
    )

    # Ajustes finais de layout e margens (Respiro do Título)
    fig.update_layout(
        title={
            'text': f"<b>Resultados:</b> {produto_sel} | {mes_sel}",
            'y': 0.96,           # Sobe o título para não amassar
            'x': 0.02,
            'xanchor': 'left',
            'yanchor': 'top',
            'font': {'size': 20, 'color': '#2c3e50'}
        },
        margin=dict(l=20, r=20, t=100, b=20), # t=100 dá o espaçamento necessário
        plot_bgcolor='rgba(0,0,0,0)',
        paper_bgcolor='rgba(0,0,0,0)',
        font_family=font_family,
        hovermode="x unified",
        legend=dict(
            orientation="h", 
            yanchor="bottom", 
            y=1.02, 
            xanchor="right", 
            x=1
        ),
        transition_duration=500
    )

    return fig

# Servidor WSGI (usado pelo gunicorn em produção)
server = app.server

# Execução local (dev)
if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=8050)